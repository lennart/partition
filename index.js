var _ = require('underscore')._,
    _s = require('underscore.string'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    glob = require('glob'),
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
    return _s.lpad(id, 9, '0').match(/.{3}/g).slice(0,3).join("/");
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
  path.exists(target, function(exists) {
    if(exists) {
      cb({
        code: "EEXIST",
        message: "Target already exists: " + target
      });
    }
    else {
      mkdirp(target, function(err) {
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
        glob("**/*", { cwd: src }, function(err, files) {
          if(err) {
            cb(err);
          }
          else {
            files.forEach(function(match) {
              var t = path.join(target, match),
                  f = path.join(src, match);
      
              if(fs.statSync(f).isDirectory()) {
                mkdirp.sync(t);
              }
              else {
                fs.linkSync(f, t);
              }
            });
            cb(null);
          }
        });
      }
    });
  }
  else {
    cb("missing source folder '" + src + "'");
  }
};

Partition.version = "0.0.1";

module.exports = Partition;