const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee');
var conn = mongoose.connection;

var uploadSchema = new mongoose.Schema({
    imagename: String
});

//create a modal from schema
var uploadModel = mongoose.model('uploadimages', uploadSchema);

module.exports = uploadModel;