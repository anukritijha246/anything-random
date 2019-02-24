var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var flag1=false;
var flag2=false;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title:'Login'});

});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({usernameField:'email'},function(email, password, done){
  User.getUserByEmail(email, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));


router.post('/register', upload.single('profileimage') ,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var companyname = req.body.companyname;
  var eid=req.body.eid
  var password = req.body.password;
  var password2 = req.body.password2;
  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('companyname','company field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);
var errors = req.validationErrors();
  if(errors){
    res.render('register', {
      errors: errors
    });
  }
  else {


  User.findOne({ email: req.body.email }, function(err, user) {
    if(err){
      res.render('register', {
        errors: errors
      });
    }
    //if a user was found, that means the user's email matches the entered email
   if (user) {
         var err = new Error('A user with that email has already registered. Please use a different email..')
        err.status = 400;
        req.flash('success', 'A user with that email has already registered. Please use a different email..');
        res.redirect('/');
        return next(err);
   } else {
         flag2=true;
   }
});

}

if(flag2==true)
{
var newUser = new User({
  name: name,
  email: email,
  eid: eid,
  companyname: companyname,
  password: password,
  profileimage: profileimage
});
User.createUser(newUser, function(err, user){
  if(err) {throw err;}
  console.log(user);
  req.flash('success', 'You are now registered and can login');
});
flag2=false;
}

res.location('/');
res.redirect('/');

});

router.get('/logout', function(req, res){
req.logout();
req.flash('success', 'You are now logged out');
res.redirect('/users/login');
});
module.exports = router;
