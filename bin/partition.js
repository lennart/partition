#!/usr/bin/env node

var bin = require('commander'),
    Partition = require('../'),
    ll = require('lazylines'),
    LineReader = ll.LineReadStream;

bin
  .version(Partition.version)
  .option("-r, --root <folder>", "The root folder to work on [.]", '.')
  .option("-w, --workers <n>", "The number of parallel workers", Number, 10);

bin.parse(process.argv);

process.stdin.resume();


var input = new LineReader(process.stdin),
    jobs = [],
    workers = [],
    partition = new Partition({root: bin.root}), i;

for(i = 0; i < bin.workers; i++) {
  workers.push(new Worker());
}

function Worker() {
  this.id = Math.random();
  this.working = false;
}

Worker.prototype.run = function(id) {
  if(id) {
    this.working = true;
    self = this;
    var cb = function(err) {
      if(err) {
        process.stderr.write(id + '\n');
      }

      // In any case logged that we processed this id
      process.stdout.write(id + '\n');
      self.run(next());
    };

    partition.link(id, cb);
  }
  else {
    this.working = false;
  }
};

function queue(id) {
  if(jobs.length == 0) {
    var found = false;
    workers.forEach(function(w) {
      if(!w.working) {
        w.run(id);
      }
    });
    if(!found) { jobs.push(id); }
  }
  else {
    jobs.push(id);
  }
}

function next() {
  return jobs.shift();
}

input.on("line", function(line) {
  var id = ll.chomp(line);

  queue(id);
});
