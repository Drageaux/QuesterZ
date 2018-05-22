var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Location = require('./location.model');

var UserSchema = new Schema({
  userId: String,
  name: String,
  location: Location
});

module.exports = mongoose.model('User', UserSchema);
