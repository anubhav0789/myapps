var express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var multer = require('multer'); //middleware for image upload
var path = require('path');
var router = express.Router();

var empModel = require('../modules/employee');
var uploadModel = require('../modules/upload');
const { nextTick } = require('process');



router.use(express.static(__dirname+'./public/'));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/* Create Middleware for check o verify login */
function checklogin(req, res, next){
  var myToken= localStorage.getItem('myToken'); //get token from localstorage
  try {
    jwt.verify(myToken, 'loginToken');
  } catch(err) {
    res.send("You need to login to access this page.");
  }
  next();
}
/* GET login page. */
router.get('/login', function(req, res, next) {
    var token = jwt.sign({ foo: 'bar' }, 'loginToken');
    localStorage.setItem('myToken', token); //Set token
    res.send('Login Successfully.');
});

router.get('/logout', function(req, res, next) {
    localStorage.removeItem('myToken'); //remove token from localstorage
    res.send('Logout Successfully.');
});


//for upload image 
var Storage = multer.diskStorage({
    destination : "./public/uploads/",
    filename : (req,file,cb)=>{
        cb(null, file.fieldname+"_"+ Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
  storage : Storage
}).single('file');

/* For image upload page */
router.get('/upload-file', checklogin, function(req, res, next) {
    var imageData = uploadModel.find({});
    imageData.exec(function(err,data){
      if(err) throw err;
      res.render('upload-file', { title: 'Employee Upload Image', records : data, success : '' });
    });
});

router.post('/upload', upload, function(req, res, next) {
  var imageData = uploadModel.find({});
  var imageFile = req.file.filename;
  var success = req.file.filename + ' uploded successfully.'
  var imageDetails = new uploadModel({
      imagename: imageFile
  })
  imageDetails.save(function(err, doc){
    if(err) throw err;
    imageData.exec(function(err,data){
      if(err) throw err;
      res.render('upload-file', { title: 'Employee Upload Image', records : data, success : success });
    })
  })
});



/* GET home page. */
router.get('/', checklogin, function(req, res, next) {
  var employee = empModel.find({});
  employee.exec(function(err, data){
    if(err) throw err;
    //console.log(data);
    res.render('index', { title: 'Employee Records', employees:data, success : '' });
  })
});


router.post('/', function(req, res) {
  var empDetails = new empModel({
    name: req.body.uname,
    email: req.body.email,
    etype: req.body.emptype,
    hourlyrate: req.body.hrlyrate,
    totalHour: req.body.ttlhr,
    total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr)
  });
  //console.log(empDetails);
  var employee1 = empModel.find({});
  empDetails.save(function(err,req1){
    if(err) throw err;
    employee1.exec(function(err,data){ 
      if(err) throw err;
      res.render('index', { title: 'Employee Records', employees:data, success : 'Record Inserted Successfully' });
    });
  });
});

//for filter 
router.post('/search/', function(req, res) {
    var filterName = req.body.fltrname.trim();
    var filterEmail = req.body.fltremail.trim();
    var filterEmpType = req.body.fltremptype;

    if(filterName !='' && filterEmail !='' && filterEmpType !=''){
      var filterCondition = {
        $and:[
          { name : filterName },
          { 
            $and : [ { email : filterEmail }, { etype : filterEmpType }] 
          }
        ]
      }
    }else if(filterName !='' && filterEmail =='' && filterEmpType !=''){
      var filterCondition = {
        $and:[
          { name : filterName },{ etype : filterEmpType }
        ]
      }
    }else if(filterName =='' && filterEmail !='' && filterEmpType !=''){
      var filterCondition = {
        $and:[
          { email : filterEmail },{ etype : filterEmpType }
        ]
      }
    }else if(filterName =='' && filterEmail =='' && filterEmpType !=''){
      var filterCondition = { etype : filterEmpType }
    }else{
      var filterCondition = '';
    }
    var employeeFilter = empModel.find(filterCondition);
    employeeFilter.exec(function(err,data){ 
      //console.log(data);
      if(err) throw err;
      res.render('index', { title: 'Employee Records', employees:data, success: '' });
    });
});

//for delete
router.get('/delete/:id', function(req, res, next) {
  var Id = req.params.id;
  var del = empModel.findByIdAndDelete(Id);
  var employee = empModel.find({});
  del.exec(function(err, data){
    if(err) throw err;
    employee.exec(function(err,data){ 
      if(err) throw err;
      res.render('index', { title: 'Employee Records', employees:data, success : 'Record Deleted Successfully.' });
    });
  })
});

//for edit
router.get('/edit/:id', function(req, res, next) {
  var Id = req.params.id;
  var edit = empModel.findByIdAndUpdate(Id);
  edit.exec(function(err, data){
    if(err) throw err;
    res.render('edit', { title: 'Edit Employee Record', employees:data });
  })
});
router.post('/update/', function(req, res, next) {
  var Id = req.body.id;
  //console.log(Id);
  var update = empModel.findByIdAndUpdate(Id, {
      name: req.body.uname,
      email: req.body.email,
      etype: req.body.emptype,
      hourlyrate: req.body.hrlyrate,
      totalHour: req.body.ttlhr,
      total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr)
  });
  var employee = empModel.find({});
  update.exec(function(err, data){
    if(err) throw err;
    employee.exec(function(err,data){ 
      if(err) throw err;
      res.render('index', { title: 'Employee Records', employees:data, success : 'Record Updated Successfully.' });
    });
    
  })
});



module.exports = router;
