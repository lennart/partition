var _ = require('underscore')._,
    _s = require('underscore.string');

function Partition(options) {
  options = options || {};

  this.root = options.root;
}

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

module.exports = Partition;