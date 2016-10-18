import { camelCase, merge } from 'lodash';
import { execFile, spawn } from 'child_process';
import parallel from 'run-parallel-limit';

// regex helpers
const HOST_NON_EXISTENT = /host does not exist/i;
const ALREADY_RUNNING = /already running/i;
const ALREADY_STOPPED = /already stopped/;
const NEWLINE = /\r?\n/;
const LIST_COLUMNS_SEP = ',';
const LIST_COLUMNS = [
  'Name',
  'Active',
  'ActiveHost',
  'ActiveSwarm',
  'DriverName',
  'State',
  'URL',
  'Swarm',
  'Error',
  'DockerVersion',
  'ResponseTime'
];

export default class DockerMachine {

  constructor(options = {}) {
    const opts = typeof options === 'string' ? { name: options } : options;
    this.name = opts.name || process.env.DOCKER_MACHINE_NAME || 'default';
  }

  static command(args, done) {
    execFile('docker-machine', [].concat(args), {
      cwd: process.env.DOCKER_MACHINE_PATH || '.',
      encoding: 'utf8'
    }, done);
  }

  static create(name, options, onData, done) {
    if (typeof name !== 'string') {
      throw new TypeError('A machine name must be provided');
    }

    if (typeof options !== 'object') {
      throw new TypeError('An options object must be provided');
    }

    if (typeof onData !== 'function') {
      throw new TypeError('A callback is required');
    }

    if (typeof done !== 'function') {
      throw new TypeError('A "done" callback is required');
    }

    const cmd = ['create'];

    for (const key in options) {
      if ({}.hasOwnProperty.call(options, key)) {
        const dash = key.length > 1 ? '--' : '-';
        cmd.push(dash + key);
        if (typeof options[key] === 'string') {
          cmd.push(options[key]);
        }
      }
    }

    cmd.push(name);

    const proc = spawn('docker-machine', cmd, {
      cwd: process.env.DOCKER_MACHINE_PATH || '.'
    });

    proc.stderr.on('data', (data) => {
      onData(data);
    });

    proc.stdout.on('data', (data) => {
      onData(null, data);
    });

    proc.on('close', done);
  }

  static status(name, done) {
    DockerMachine.command(['status', name], (err, stdout) => {
      err ? done(err) : done(null, stdout.trim().toLowerCase());
    });
  }

  static isRunning(name, done) {
    DockerMachine.status(name, (err, status) => {
      done(err, status === 'running');
    });
  }

  static start(name, done) {
    DockerMachine.command(['start', name], (err) => {
      if (HOST_NON_EXISTENT.test(err)) {
        done(new Error(`Docker host "${name}" does not exist`));
      } else if (ALREADY_RUNNING.test(err)) {
        done();
      } else {
        done(err);
      }
    });
  }

  static stop(name, done) {
    DockerMachine.command(['stop', name], (err) => {
      if (HOST_NON_EXISTENT.test(err)) {
        done(new Error(`Docker host "${name}" does not exist`));
      } else if (ALREADY_STOPPED.test(err)) {
        done();
      } else {
        done(err);
      }
    });
  }

  static env(name, options, callback) {
    let opts = options;
    let done = callback;

    if (typeof options === 'function') {
      done = options;
      opts = {};
    }

    const args = ['env'];

    if (opts.json) {
      opts = Object.assign({}, opts, { parse: true });
    }

    if (opts.parse) {
      args.push('--shell', 'bash');
    } else if (opts.shell) {
      args.push('--shell', opts.shell);
    }

    args.push(name);

    DockerMachine.command(args, function (err, stdout) {
      if (err) {
        return done(err);
      }

      if (!opts.parse) {
        return done(null, stdout.trim());
      }

      const res = {};

      stdout.split(/\n+/).forEach((line) => {
        const m = /^export (.+)="([^"]+)/i.exec(line);

        if (m) {
          res[m[1]] = m[2];
        }
      });

      done(null, res);
    });
  }

  static ssh(name, command, done) {
    let cmd = command;

    if (Array.isArray(cmd)) {
      cmd = cmd.join(' ');
    } else if (typeof cmd !== 'string') {
      throw new TypeError('Command must be an array or string');
    }

    cmd = cmd.trim();

    if (!cmd) {
      throw new TypeError('Command may not be empty');
    }

    DockerMachine.command(['ssh', name, cmd], done);
  }

  static inspect(name, done) {
    let callback = done;

    if (typeof done !== 'function') {
      callback = () => {};
    }

    DockerMachine.command(['inspect', name], (err, stdout) => {
      if (err) {
        return callback(err);
      }

      let data;

      try {
        data = JSON.parse(stdout.trim());
      } catch (error) {
        return callback(error);
      }

      callback(null, merge({}, data));
    });
  }

  static list(options, callback) {
    let opts = options;
    let done = callback;

    if (typeof options === 'function') {
      done = options;
      opts = {};
    }

    // Build template, escape values with URL encoding
    const template = LIST_COLUMNS.map((name) => {
      if (name === 'ResponseTime') {
        return `{{ .${name} | printf "%d" }}`;
      }
      return `{{ .${name} | urlquery }}`;
    }).join(LIST_COLUMNS_SEP);

    const args = ['ls', '-f', template];

    // Optionally add a timeout (in seconds)
    // to deal with docker/machine#1696.
    if (opts.timeout) {
      args.push('-t', String(opts.timeout));
    }

    DockerMachine.command(args, (err, stdout) => {
      if (err) {
        return done(err);
      }

      const machines = stdout.split(NEWLINE).filter(Boolean).map((line) => {
        const values = line.split(LIST_COLUMNS_SEP);
        const machine = {};

        LIST_COLUMNS.forEach((name, i) => {
          const key = camelCase(name);
          const val = values[i];

          machine[key] = val === '' ? null : decodeURIComponent(val);
        });

        // ResponseTime is in nanoseconds
        machine.responseTime = parseInt(machine.responseTime) / 1e6;
        machine.state = machine.state.toLowerCase();
        machine.activeHost = machine.activeHost === 'true';
        machine.activeSwarm = machine.activeSwarm === 'true';

        if (machine.dockerVersion === 'Unknown') {
          machine.dockerVersion = null;
        }

        return machine;
      });

      if (!opts.inspect) {
        return done(null, machines);
      }

      // Add additional metadata from `docker-machine inspect <name>`
      parallel(machines.map((machine) => (next) => {
        DockerMachine.inspect(machine.name, (error, data) => {
          if (error) {
            next(error);
          } else {
            next(null, Object.assign({}, machine, data));
          }
        });
      }), 4, done);
    });
  }
}

// static methods to add to the prototype of a class instance
const INSTANCE_METHODS = [
  'create',
  'status',
  'isRunning',
  'start',
  'stop',
  'env',
  'ssh',
  'inspect'
];

INSTANCE_METHODS.forEach((method) => {
  DockerMachine.prototype[method] = function () {
    const args = Array.from(arguments);
    args.unshift(this.name);
    DockerMachine[method].apply(null, args);
  };
});
