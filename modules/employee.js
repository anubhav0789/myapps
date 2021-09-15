const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee');
var conn = mongoose.connection;

var employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    etype: String,
    hourlyrate: Number,
    totalHour: Number,
    total: Number,
});

//create a modal from schema
var employeeModel = mongoose.model('Employee', employeeSchema);

module.exports = employeeModel;