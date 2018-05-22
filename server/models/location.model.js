var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
  latitude: Schema.Types.Decimal128,
  longitude: Schema.Types.Decimal128
});

module.exports = mongoose.model('Location', LocationSchema);
