var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Place = require('./place.model');

var UserSchema = new Schema({
  userId: String,
  name: String,
  place: place
});

module.exports = mongoose.model('User', UserSchema);
