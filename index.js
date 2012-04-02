var _ = require('underscore')._,
    _s = require('underscore.string'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs');

function Partition(options) {
  options = options || {};

  this.root = path.resolve(process.cwd(), options.root);
}

/*
 * Synchronous API Methods
 */

Partition.prototype.scheme = function(id) {
  if(_.isNumber(id)) {
    return _s.sprintf("%09d", id).match(/\d{3}/g).join("/");  
  }
  else if (_.isString(id)) {
    return id.match(/.{3}/g).slice(0,3).join("/");
  }
  else {
    return null;
  }
};

Partition.prototype.resolve = function(target) {
  if(target) {
    return path.resolve(this.root, target.toString());
  }
  else {
    return this.root;
  }
};

/*
 * Asynchronous API Methods
 */

Partition.prototype.prepare = function(target, cb) {
  var parent = path.dirname(target);
  path.exists(parent, function(exists) {
    if(exists) {
      cb(null);
    }
    else {
      mkdirp(parent, function(err) {
        cb(err);
      });
    }
  }); 
};

Partition.prototype.link = function(id, cb) {
  var src = this.resolve(id),
      target = this.resolve(this.scheme(id));

  if(path.existsSync(src)) {
    this.prepare(target, function(err) {
      if(err) {
        cb(err);
      }
      else {
        fs.link(src, target, cb);
      }
    });
  }
  else {
    cb("missing source folder '" + src + "'");
  }
};

module.exports = Partition;