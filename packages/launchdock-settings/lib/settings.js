/**
 * The global namespace for Settings.
 * @namespace Settings
 */
Settings = new Mongo.Collection("settings");

Settings.schema = new SimpleSchema({

  siteTitle: {
    type: String,
    optional: true,
    label: 'Site Title'
  },

  adminEmail: {
    type: String,
    optional: true,
    label: 'Admin Email'
  },

  defaultAppImage: {
    type: String,
    optional: true,
    label: 'Default App Image'
  },

  tutumUsername: {
    type: String,
    optional: true,
    label: 'Tutum Username',
    autoform: {
      private: true
    }
  },

  tutumToken: {
    type: String,
    optional: true,
    label: 'Tutum API Token',
    autoform: {
      private: true
    }
  },

  tutumBalancerUuid: {
    type: String,
    optional: true,
    label: 'Tutum Load Balancer UUID',
    autoform: {
      private: true
    }
  },

  tutumWildcardDomain: {
    type: String,
    optional: true,
    label: 'Tutum Default Wildcard Domain',
    autoform: {
      private: true
    }
  },

  rancherApiUrl: {
    type: String,
    optional: true,
    label: 'Rancher API URL',
    autoform: {
      private: true
    }
  },

  rancherApiKey: {
    type: String,
    optional: true,
    label: 'Rancher API Key',
    autoform: {
      private: true
    }
  },

  rancherApiSecret: {
    type: String,
    optional: true,
    label: 'Rancher API Secret',
    autoform: {
      private: true
    }
  },

  awsKey: {
    type: String,
    optional: true,
    label: 'AWS Key',
    autoform: {
      private: true
    }
  },

  awsSecret: {
    type: String,
    optional: true,
    label: 'AWS Secret',
    autoform: {
      private: true
    }
  },

  awsRegion: {
    type: String,
    optional: true,
    label: 'AWS Region',
    autoform: {
      private: true
    }
  },

  stripeMode: {
    type: String,
    optional: true,
    label: 'Mode',
    allowedValues: ['Test', 'Live'],
    defaultValue: 'Test',
    autoform: {
      private: true
    }
  },

  stripeTestPublishableKey: {
    type: String,
    optional: true,
    label: 'Test - Publishable Key'
  },

  stripeTestSecretKey: {
    type: String,
    optional: true,
    label: 'Test - Secret Key',
    autoform: {
      private: true
    }
  },

  stripeLivePublishableKey: {
    type: String,
    optional: true,
    label: 'Live - Publishable Key'
  },

  stripeLiveSecretKey: {
    type: String,
    optional: true,
    label: 'Live - Secret Key',
    autoform: {
      private: true
    }
  },

  sslPrivateKey: {
    type: String,
    optional: true,
    label: 'Private Key',
    autoform: {
      private: true
    }
  },

  sslCertificate: {
    type: String,
    optional: true,
    label: 'Certificate',
    autoform: {
      private: true
    }
  },  

  sslRootCertificate: {
    type: String,
    optional: true,
    label: 'Root Certificate',
    autoform: {
      private: true
    }
  },

  kadiraAppId: {
    type: String,
    optional: true,
    label: 'App Id',
    autoform: {
      private: true
    }
  },

  kadiraAppSecret: {
    type: String,
    optional: true,
    label: 'App Secret',
    autoform: {
      private: true
    }
  },

  slackWebhookUrl: {
    type: String,
    optional: true,
    label: 'Webhook URL',
    autoform: {
      private: true
    }
  },

  createdAt: {
    type: Date,
    label: 'Created',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date()
        };
      } else {
        this.unset();
      }
    },
    denyUpdate: true
  },

  updatedAt: {
    type: Date,
    label: 'Updated',
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
});

Settings.attachSchema(Settings.schema);
