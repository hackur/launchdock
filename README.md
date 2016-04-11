# Launchdock
Launchdock is an automated [Docker](https://docker.com) orchestration tool built with [Meteor.js](https://meteor.com) that uses either [Docker Cloud](https://cloud.docker.com/) or [Rancher](https://rancher.com)to configure and launch Meteor application container stacks that consist of a Meteor app, MongoDB replica set, and HaProxy load balancer(s) - all on your own infrastructure with any major cloud provider.
[![Code Climate](https://codeclimate.com/github/reactioncommerce/launchdock/badges/gpa.svg)](https://codeclimate.com/github/reactioncommerce/launchdock)

## Setup
The first thing you will need to do is deploy Launchdock itself. Any standard Meteor deployment method is supported, but the recommended approach is to use [the Docker family of tools](https://www.docker.com/docker-toolbox). Specifically, we'll be using Docker to build a container image of Launchdock, then use [Docker Machine](https://docs.docker.com/machine/) to set up a server on AWS and deploy the container to it. ([Most major providers are an option](https://docs.docker.com/machine/drivers/), but we'll be using AWS for the duration of these docs). Ok, let's get started!

First, you will need to install the [Docker Toolbox](https://www.docker.com/docker-toolbox) and grab your AWS credentials. Once you have Docker, Docker Compose, and Docker Machine installed, you can launch/manage servers and deploy Dockerized apps to them.

### Build
Before you can deploy Launchdock, you will need to build a Docker image and push it out to Docker Hub.  First, clone this repo:

```sh
git clone https://github.com/reactioncommerce/launchdock.git

cd launchdock
```

Now build an image

```sh
docker build -t yourname/launchdock:latest .
```

And push to Docker Hub

```sh
docker push yourname/launchdock:latest .
```

### Deploy
[Docker Machine Documentation](https://docs.docker.com/machine/)

For convenience, set local environment variables for your AWS credentials so you don't have to worry about copy/pasting them regularly (and so anyone can use the same commands below while using their own credentials).

Open your `.bashrc` in a text editor and add your AWS credentials like so:

```sh
# ~/.bashrc

export AWS_KEY='your key here'
export AWS_SECRET='your secret here'
```

If your terminal is already open, you'll now need to `source` that `.bashrc` file before the new exports will be available in your shell environment.

```sh
source ~/.bashrc
```

(simply opening a new terminal window accomplishes the same thing)

Now you're ready to use Docker Machine to manage servers on AWS. The command below shows how to create an AWS machine with all of the required options defined.  See the docs for the rest of the [available options for the AWS driver](https://docs.docker.com/machine/drivers/aws/#options). Log into your AWS dashboard and pick the region, availability zone, VPC ID, and instance type that works best for you.

```sh
docker-machine create --driver amazonec2 \
  --amazonec2-access-key $AWS_KEY \
  --amazonec2-secret-key $AWS_SECRET \
  --amazonec2-region us-east-1 \
  --amazonec2-zone b \
  --amazonec2-vpc-id vpc-123456 \
  --amazonec2-instance-type t2.medium \
  launchdock
```

The final line (`launchdock`) can be set to anything you want and is the name that will be referenced when using Docker Machine to manage the server.  It is also the name that will be assigned to the server in the EC2 dashboard.  So do yourself a favor and be obvious with your naming choices.  ;)

Now you should be able to see your available machines by running:

```sh
docker-machine ls
```

which should output a table like this...

Name       | Active | Driver     | State   | URL
---------- | ------ | ---------- | ------- | --------------------------
default    |        | virtualbox | Running | tcp://192.168.99.101:2376
launchdock | *      | amazonec2  | Running | tcp://101.123.145.132:2376

If you were setting up a domain name to point at this server, the IP address for `launchdock` (101.123.145.132) would be the one you'd want.  The `*` in the ACTIVE column means that your Docker environment is currently pointed at that server (instead of your local Kitematic virtualbox instance, for example).  If that particular machine wasn't active, you'd select it by running:

```sh
eval "$(docker-machine env launchdock)"
```

Now any docker commands you use (build, run, etc.) will be run on that new server.  So the next step will be to start up the Launchdock container you built above (assumes you've got Mongo convered elsewhere):

```sh
docker run -p 80:80 \
  --name "launchdock" \
  -e ROOT_URL="http://example.com/" \
  -e MONGO_URL="mongodb://user:pw@mongo_url:27017/dbName" \
  -e MONGO_OPLOG_URL="mongodb://user:pw@mongo_url:27017/local" \
  -e MAIL_URL="smtp://user:pw@smtp.org:587" \
  yourname/launchdock:latest
```

Or you can optionally run your Mongo database in another container on the same server and link it with [Docker Compose](https://docs.docker.com/compose).

```yaml
# docker-compose.yml

launchdock:
  image: ongoworks/launchdock2:latest
  links:
    - mongo
  ports:
    - "80:80"
  environment:
    ROOT_URL: "http://example.com"
    MONGO_URL: "mongodb://mongo-launchdock:27017/dbName"
    MAIL_URL: "smtp://user:pw@smtp.org:587"

mongo-launchdock:
  image: mongo:latest
  command: mongod --storageEngine=wiredTiger
```

Note: If you're familiar with the Docker tool set, you may consider a more advanced setup across multiple servers using [Docker Swarm](https://docs.docker.com/swarm/) so you can have a replica set and make use of the MongoDB oplog.

Launchdock should now be running and you can sign in with the default user with username `admin` and password `admin`.  (Obviously, you should change this).

Default `LD_EMAIL`, `LD_USERNAME`, `LD_PASSWORD` can be configured with [Meteor.settings](http://docs.meteor.com/#/full/meteor_settings).

### Tutum
Before you can use Launchdock, you'll have to set up a few services and configs that it depends on. If you don't have a [Docker Hub](https://hub.docker.com/) account already, go sign up there and then use those credentials to log into [Tutum](https://www.tutum.co/).  The next several steps will all take place in Tutum's dashboard.  

#### Nodes
There are a few things you need to set up in Tutum before Launchdock will be able to start launching Meteor stacks. The first is to [start up some nodes](https://support.tutum.co/support/solutions/articles/5000523221-your-first-node) (servers) on your provider of choice (AWS, Digital Ocean, etc) using Tutum's dashboard. Launchdock doesn't care which provider you're using, so feel free to use any supported provider that you prefer. (Note that we've experienced some network performance issues with Microsoft Azure and [Tutum's overlay network](http://www.weave.works/products/weave-net/), so Azure is currently not recommended for use with Launchdock).

The only required configuration for your servers will be that you need the following [deploy tags](https://support.tutum.co/support/solutions/articles/5000508859-deploy-tags) set on at least one server: `app`, `mongo1`, `mongo2`, `mongo3`, `lb`. Deploy tags are how Tutum and Launchdock choose which server each type of container gets deployed on. The table below outlines what service will be deployed on a given server that contains the specified tag.

Tag      | Details                       | Server Requirements
-------- | ----------------------------- | -------------------------
`app`    | The Meteor app                | Depends on your app
`mongo1` | MongoDB replica set primary   | [Mongo Docs][1]
`mongo2` | MongoDB replica set secondary | [Mongo Docs][1]
`mongo3` | MongoDB replica set arbiter   | [Mongo Docs (arbiter)][2]
`lb`     | HaProxy load balancer         | [HaProxy Docs][3]

Note that you can put multiple deploy tags on a single server (which would allow multiple container types to be able to deploy to that server). How many servers you launch for your stack is entirely up to you.  As long as all of the deploy tags exist somewhere, Tutum will launch the containers wherever you choose. You can add the 5 deploy tags on 5 different servers (best performance) OR add all of the tags on 1 server (definitely not recommended, but it would work if the server was powerful enough) OR any combination you choose.  For example, according to the [MongoDB docs][2]:

> _"Arbiters have minimal resource requirements and do not require dedicated hardware. You can deploy an arbiter on an application server or a monitoring host."_

However...

> _"Do not run an arbiter on the same system as another member of the replica set."_

That said, you might choose to add the `app` and `mongo3` tags to the same server to share resources and save a little money.  Or perhaps have `lb` (load balancer) and `mongo3` share. However, the official recommendation here is to have a dedicated server for every part of the stack for both performance and redundancy reasons. You can save money by just running a lower power server for things like the MongoDB arbiter (instead of sharing a server with another service in your stack). Just note that each service has its own hardware requirements, so pick your server specs based on the requirements of the service that will be running on it (see links in the table above for more info on requirements).

Once you have servers running for each of the 5 deploy tags mentioned above, you're ready to set up a load balancer and start configuring Launchdock to communicate with Tutum.

##### SSL
There are two methods of using an SSL certificate with Launchdock. The first is a "default certificate" that any of your stacks may use (subdomains with a wildcard, for example).  The other type is a certificate that is only for a specific stack.  The latter option can be managed in the Launchdock UI, so we'll cover that later.  However, the default wildcard certificate requires a manual step.  

First, you need to create a pem file with your private key and your certificate. To read more about creating a pem file, see [this](https://www.digicert.com/ssl-support/pem-ssl-creation.htm) article.  

At the very least, your file should contain the following content in the following order:

```sh
-----BEGIN RSA PRIVATE KEY-----
      private key content
-----END RSA PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
      certificate content
-----END CERTIFICATE-----
```

But you may also have a root certificate.  In that case:

```sh
# wildcard.pem

-----BEGIN RSA PRIVATE KEY-----
    private key content
-----END RSA PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
    certificate content
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
    root certificate content
-----END CERTIFICATE-----
```

Once you've created the pem file, you need to put it in `/private/certs/wildcard.pem` so Launchdock can access it.

#### Load Balancers
There isn't currently any load balancer management in Launchdock (near future), so the current recommended way to set up a load balancer on Tutum is by using Tutum's CLI tool.  You can learn how to install it [here](https://support.tutum.co/support/solutions/articles/5000049209-installing-the-command-line-interface-tool).

Once installed, you can launch a load balancer service with the following command:

```sh
# start a load balancer
tutum service run --role global -p 80:80 \
  -e BACKEND_PORT=80 \
  -e HEALTH_CHECK="check inter 2000 rise 2 fall 3" \
  -e BALANCE="leastconn" \
  --tag lb \
  --deployment-strategy HIGH_AVAILABILITY \
  --autorestart ALWAYS \
  tutum/haproxy:latest
```

If you'd like to set a default SSL certificate that can be used across all Launchdock stacks (a wildcard, for example), then you need to create a pem file with your key/cert (see SSL section above for details).

Once you have created a pem file and placed it in `/private/certs/wildcard.pem`, you can launch a load balancer service with it like this:

```sh
# start a load balancer service with default SSL cert
tutum service run --role global -p 80:80 -p 443:443 \
  -e BACKEND_PORT=80 \
  -e DEFAULT_SSL_CERT="$(awk 1 ORS='\\n' ./private/certs/wildcard.pem)" \
  -e HEALTH_CHECK="check inter 2000 rise 2 fall 3" \
  -e BALANCE="leastconn" \
  --tag lb \
  --deployment-strategy HIGH_AVAILABILITY \
  --autorestart ALWAYS \
  tutum/haproxy:latest
```

##### Tutum configuration
Go to the Launchdock settings page at `/settings` and add your [Tutum username and API key](https://docs.tutum.co/v2/api/), the default wildcard domain (if applicable), and the UUID of the load balancer you started above.

### Readme TODO:
- launch stacks
- configure SSL for a stack

[1]: https://docs.mongodb.org/manual/administration/production-notes/#hardware-considerations
[2]: https://docs.mongodb.org/manual/tutorial/add-replica-set-arbiter/#add-an-arbiter-to-replica-set
[3]: https://haproxy.com/doc/hapee/1.5/introduction.html#hardware-requirements
