#!/usr/bin/env node

var bin = require('commander'),
    Partition = require('../'),
    ll = require('lazylines'),
    LineReader = ll.LineReadStream,
    _ = require('underscore'),
    fs = require('fs'),
    workers = [],
    jobs = [],
    counter = 0,
    out, error, i;

bin
  .version(Partition.version)
  .option("-r, --root <folder>", "The root folder to work on [.]", '.')
  .option("-w, --workers <n>", "The number of parallel workers", Number, 10)
  .option("-o, --output <file>", "File to write processed ids to")
  .option("-e, --error <file>", "File to write error ids to");

bin.parse(process.argv);

out = _.isString(bin.output) ? fs.createWriteStream(bin.output, { flags: "a" }) : process.stdout;
error = _.isString(bin.output) ? fs.createWriteStream(bin.error, { flags: "a" }) : process.stderr;


function Worker() { this.working = false; }

Worker.prototype.run = function(id) {
  if(id) {
    this.working = true;
    var self = this,
        cb = function(err) {
          if(err) { error.write(id + '\n'); }

          if ((++counter % 10000) == 0) { process.stdout.write("."); }

          // In any case logged that we processed this id
          out.write(id + '\n');
          self.run(next());
        };

    partition.link(id, cb);
  }
  else { this.working = false; }
};

function queue(id) {
  if(jobs.length == 0) {
    // Queue is empty, check for available worker
    var found = false;
    for(i = 0; i < workers.length; i++) {
      if(!workers[i].working) {
        workers[i].run(id);
        found = true;
        break;
      }
    }
    // Otherwise queue the job
    if(!found) { jobs.push(id); }
  }
  else {
    jobs.push(id);
  }
}

function next() { return jobs.shift(); }

for(i = 0; i < bin.workers; i++) { workers.push(new Worker()); }

process.stdin.resume();

var input = new LineReader(process.stdin),
    partition = new Partition({root: bin.root});


input.on("line", function(line) {
  var id = ll.chomp(line);

  queue(id);
});

process.on("exit", function() { process.stdout.write("\n"); });
