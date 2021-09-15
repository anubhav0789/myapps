var express = require('express');
var empModel = require('../modules/employee')
var router = express.Router();

var employee = empModel.find({});

/* GET home page. */
router.get('/', function(req, res, next) {
  employee.exec(function(err, data){
    if(err) throw err;
    //console.log(data);
    res.render('index', { title: 'Employee Records', employees:data });
  })
});

router.post('/', function(req, res, next) {
  var empDetails = new empModel({
    name: req.body.uname,
    email: req.body.email,
    etype: req.body.emptype,
    hourlyrate: req.body.hrlyrate,
    totalHour: req.body.ttlhr,
    total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr)
  });
  console.log(empDetails);
  
  empDetails.save(function(err,req1){
    //if(err) throw err;
    employee.exec(function(err,data){ 
      if(err) throw err;
      res.render('index', { title: 'Employee Records', employees:data });
    });
  });
});

module.exports = router;
