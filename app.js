var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/new_visions');

// Connect to students table, but have no schema at the moment
var Student = mongoose.model('Student', {})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route for all students
app.route('/students')
    .get(function(req, res) {
      Student.find(function(err, p){
        res.json(p);
      });
    });

// Route to get absent students
app.route('/students/absent')
    .get(function(req, res) {
      // TODO add query for changing attendence percentage
      var attendence = .9
      var absentQuery = Student.find()
          // select specific data to show
          .select('studentId studentName cohort attendanceSy1112 attendanceSy1213 attendanceSy1314 attendanceYtd percentDaysLateYtd numberOfDaysAbsentLast10Days numberOfDaysAbsentLast5Days attendanceYtdFilter')
          .where('attendanceYtd').lte(attendence);

      switch(req.query.prev_years) {
        case '3':
          absentQuery.where('attendanceSy1112').lte(attendence);
        case '2':
          absentQuery.where('attendanceSy1213').lte(attendence);
        case '1':
          absentQuery.where('attendanceSy1314').lte(attendence);
      };

      absentQuery.exec(function(err, p){
            res.json(p);
          });
    });

app.route('/students/123')
    .get(function(req, res) {
      Student.findOne({'studentId': parseInt(req.params.studentId)}, function(err, p){
        res.send(req.query);
      });
    });

app.route('/students/:studentId')
    .get(function(req, res) {
      Student.findOne({'studentId': parseInt(req.params.studentId)}, function(err, p){
        res.json(p);
      });
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
