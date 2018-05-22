var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
  id: String,
  address: String,
  address: String,
  type: String,
  point: Schema.Types.Mixed
});

module.exports = mongoose.model('Place', PlaceSchema);
