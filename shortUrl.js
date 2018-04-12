// create mongo collection and method to start

const mongoose = require('mongoose');
const schema = mongoose.Schema;

const urlSchema = new schema({
  originalUrl: String,
  shortUrl: String,
});


const urlObjModel = mongoose.model('urlObj', urlSchema);

module.exports = urlObjModel;