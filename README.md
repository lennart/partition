# Partition
[![Build Status](https://secure.travis-ci.org/lennart/partition.png)](http://travis-ci.org/lennart/partition)

[Paperclip](http://github.com/thoughtbot/paperclip)-style id partitioning of 
folders written for [node.js](http://nodejs.org) including a simple __CLI__.

## Installation

    npm install partition

## Usage

```shell
$ ls .
123445322
$ echo 123445322 | partition
$ ls
123 123445322
$ ls 123
445
$ ls 123/445
322
```

or if you want to, use it as a Library in you projects

```javascript
var Partition = require('partition'),
    partition = new Partition({root: "/tmp"}); // root defaults to process.cwd()

partition.link(123445322, function(err) {
  console.log("Linked", id, "to", partition.resolve(partition.scheme(id)));
});
```

Will print `Linked 123445322 to /tmp/123/445/322`


## Feedback

If you find this library/tool useful, please tell me about it. If not, do the same, but be sure to do it in the [issue tracker](http://github.com/lennart/partition/issues).