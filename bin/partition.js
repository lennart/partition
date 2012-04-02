#!/usr/bin/env node

var bin = require('commander'),
    Partition = require('../'),
    ll = require('lazylines'),
    LineReader = ll.LineReadStream;

bin
  .version(Partition.version)
  .option("-r, --root <folder>", "The root folder to work on [.]", '.');

bin.parse(process.argv);

process.stdin.resume();


var input = new LineReader(process.stdin),
    partition = new Partition({root: bin.root});

function complete(id) {
  var cb = function(err) {
    if(err) {
      console.error(id);
    }

    // In any case logged that we processed this id
    console.log(id);
  };

  partition.link(id, cb);
}

input.on("line", function(line) {
  var id = ll.chomp(line);

  complete(id);
});
