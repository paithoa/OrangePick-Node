const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const baseUrl = 'https://pipier-surplus.000webhostapp.com'; 
const targetBaseUrl = 'https://pipier-surplus.000webhostapp.com/Personal_details.html';
// const targetHomeUrl = 'https://pipier-surplus.000webhostapp.com/Personal_details.html';

function handleRedirect(req, res) {
  const targetUrl = targetBaseUrl + req.originalUrl;
  res.redirect(targetUrl);
}


//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const { body: { user } } = req;
  console.log(user)
  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }
  
  const finalUser = new Users(user);

  finalUser.setPassword(user.password);
  finalUser.setType(user.type);
  finalUser.save().then(() => passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      console.log(user.token)
      return res.sendFile("/Users/admin/Documents/OrangePick-Project/OrangePick/Personal_details.html?"+user.token);
    }

    return status(400).info;
  })(req, res, next)
  ) 

  

  // var options = {
  //   headers: {
  //       'Authorization': 'Token ' + user.token,
  //       'content': 'application/json'
  //   }
  // };
  //return res.sendFile("/Users/admin/Documents/OrangePick-Project/OrangePick/Personal_details.html")


  
  
    
    

  
  
  // sign up flow
  // log them in 
  // after logging them in pass the token key to the route which is
  // dashboard and personal details

});



// router.get('/personaldetails',(req,res,next) => { 
//   console.log(req)
//   res.redirect(targetBaseUrl)
// })

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}

router.post('/personaldetails',auth.optional,verifyToken,(req,res,next) => { 


  const { payload: { id } } = req;
  //console.log(id)
  // token 
  console.log(req.query)
  // console.log(JSON.stringify(req.headers));

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
//   User.findById(req.user.id, function (err, user) {

//     // todo: don't forget to handle err

//     if (!user) {
//         req.flash('error', 'No account found');
//         return res.redirect('/edit');
//     }
//     console.log(req.body)
    
//     // good idea to trim 
//     var email = req.body.email.trim();
//     var username = req.body.username.trim();
//     var firstname = req.body.firstname.trim();
//     var lastname = req.body.lastname.trim();
//     var dateofbirth = req.body.dateofbirth.trim();
//     var city = req.body.city.trim();
//     var postcode = req.body.postcode.trim();
//     var gender = req.body.gender.trim()
//     // validate 
//     if (!email || !username || !firstname || !lastname) { // simplified: '' is a falsey
//         req.flash('error', 'One or more fields are empty');
//         return res.redirect('/personaldetails'); // modified
//     }

//     // no need for else since you are returning early ^
//     user.first_name = firstname;
//     user.last_name = lastname;
//     user.dateofbirth = dateofbirth;
//     user.city = city;
//     user.postcode = postcode;
//     user.gender = gender;

//     // don't forget to save!
//     user.save(function (err) {

//         // todo: don't forget to handle err

//         res.redirect('/personaldetails');
//     });
// });
  res.redirect("/Users/admin/Documents/OrangePick-Project/OrangePick/Personal_details___1.html")
})





//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    if(passportUser) {
      const user = passportUser;
      user.token = passportUser.generateJWT();
      console.log(user.token)
      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;
  //console.log(id)
  console.log(JSON.stringify(req.headers));

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

module.exports = router;