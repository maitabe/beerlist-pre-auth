var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
//adding strategy to authenticate
var LocalStrategy = require('passport-local').Strategy;

mongoose.connect('mongodb://localhost/beers');
//change to mongoose default promises lib, when you call .then
mongoose.Promise = global.Promise;

var Beer = require("./models/BeerModel");
var Review = require("./models/ReviewModel");
var User = require("./models/UserModel");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));
app.use(express.static('node_modules'));

//------------------------
// For authentication:
var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({ secret: 'mySecretKey' }));

//initialize passport
app.use(passport.initialize());
//initialize session with passport
app.use(passport.session());
//------------------------

//create a new session that give an id to the user
//from here the user will be send back through the app.get /currentUser
passport.serializeUser(function (user, done) {
  done(null, user);
});

//this will populate the req.user with the user JSON
passport.deserializeUser(function (user, done) {
  done(null, user);
});

//create a global middleware that intercept the request from  app.post
//and verify if the data (user) is authenticated after this goes to serializeUser to create a new session
passport.use('register', new LocalStrategy(function (username, password, done) {
  User.findOne({ 'username': username }, function (err, user) {
    // In case of any error return
    if (err) {
      console.log('Error in SignUp: ' + err);
      return done(err);
    }

    // already exists
    if (user) {
      console.log('User already exists');
      return done(null, false);
    } else {
      // if there is no user with that matches
      // create the user
      var newUser = new User();

      // set the user's local credentials
      newUser.username = username;
      newUser.password = password;    // Note: Should create a hash out of this plain password!

      // save the user
      newUser.save(function (err) {
        if (err) {
          console.log('Error in Saving user: ' + err);
          throw err;
        }

        console.log('User Registration successful');
        return done(null, newUser);
      });
    }
  });
}));


//register route
app.post('/register', passport.authenticate('register'), function (req, res) {
  //req.user contain the data fromthe auth.js factory and send it to the passport.use to verify the user
  res.json(req.user);
});

// send the current user back!
app.get('/currentUser', function (req, res) {
  res.send(req.user);
});

app.get('/beers', function (req, res) {
  Beer.find(function (error, beers) {
    res.send(beers);
  });
});

app.post('/beers', function (req, res, next) {
  var beer = new Beer(req.body);

  beer.save(function(err, beer) {
    if (err) { return next(err); }

    res.json(beer);
  });
});

app.put('/beers/:id',  function(req, res, next) {
  Beer.findById(req.params.id, function (error, beer) {
    beer.name = req.body.name;

    beer.save(function(err, beer) {
      if (err) { return next(err); }

      res.json(beer);
    });
  });
});

app.delete('/beers/:id', function (req, res) {
  Beer.findById(req.params.id, function (error, beer) {
    if (error) {
      res.status(500);
      res.send(error);
    } else {
      beer.remove();
      res.status(204);
      res.end();
    }
  });
});

app.post('/beers/:id/reviews', function(req, res, next) {
  Beer.findById(req.params.id, function(err, beer) {
    if (err) { return next(err); }

    var review = new Review(req.body);

    beer.reviews.push(review);

    beer.save(function (err, beer) {
      if (err) { return next(err); }

      res.json(review);
    });
  });
});

app.delete('/beers/:beer/reviews/:review', function(req, res, next) {
  Beer.findById(req.params.beer, function (err, beer) {
    for (var i = 0; i < beer.reviews.length; i ++) {
      if (beer.reviews[i]["_id"] == req.params.review) {
        beer.reviews.splice(i, 1);
        beer.save();

        res.status(204);
        res.end();
      }
    }
  });
});

app.listen(8000, function(){
  console.log('beer app started running');
});