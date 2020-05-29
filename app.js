const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
var flash = require('express-flash-messages')
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
var mongodb = require('mongodb');
var url = "mongodb+srv://admin:admin@cluster0-hkw5i.mongodb.net/test?retryWrites=true&w=majority";
// var MongoClient = mongodb.MongoClient;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:admin@cluster0-hkw5i.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("users");
  // perform actions on the collection object
  client.close();
});
//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();
app.use(flash())
// Use connect method to connect to the Server
// MongoClient.connect(url, function (err, db) {
//   if (err) {
//     console.log('Unable to connect to the mongoDB server. Error:', err);
//   } else {
//     console.log('Connection established to', url);

//     // do some work here with the database.

//     //Close connection
//     db.close();
//   }
// });


//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect(url);
mongoose.set('debug', true);

//Models and Routes
require('./models/Users');
require('./config/passport');
app.use(require('./routes'));

 
//Error handlers & middlewares
if(!isProduction) {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});
app.get('/', (req, res) => res.render("index.ejs"))

app.get('/login', (req, res) => res.render("index.ejs"))
app.get('/signup',(req,res) => res.render("Sign_Up.ejs"))
app.get('/signup_customer', (req, res) => res.render("Sign_Up___Consumer.ejs"))
app.get('/signup_business', (req,res)=> res.render('Sign_Up_Business.ejs'))
app.get('/personal_details', (req,res) => res.render('Personal_details.ejs'))
app.get('/personal_details_1', (req,res)=> res.render('Personal_details___1.ejs'))
app.get('/dashboard', (req,res) => res.send('dashboard.ejs'))
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log('Server running on http://localhost:8000/'));