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
  console.log(req)
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
      return res.render("Personal_details.ejs", {token:user.token,id:user.id});
    }

      return status(400).info;
   })(req, res, next)
  ) 
});

router.post('/personaldetails',auth.optional,(req,res,next) => { 
  var request = req.body.user
  //const { payload: { id } } = req;
  var id = req.body.user.id
  //console.log(id)
  // token 
  // console.log(id)
  // console.log(JSON.stringify(req.headers));
  // console.log(id)
  var token = request.token

  Users.findById(id, function (err, user) {
    if(!user) {
      return res.sendStatus(400);
    }
    //console.log(user.email);
    //res.json({ user: user.toAuthJSON() });
    // good idea to trim 
  var firstname = request.firstname
  var lastname = request.lastname
  var dateofbirth = request.date
  var city = request.city
  var postcode = request.postcode
  var gender = request.gender
  // validate 
  if (!firstname || !lastname) { // simplified: '' is a falsey
      return res.redirect('/api/users'); // modified
  }
  // no need for else since you are returning early ^
  user.firstname = firstname;
  user.lastname = lastname;
  user.dob = dateofbirth;
  user.city = city;
  user.postcode = postcode;
  user.gender = gender;

  // don't forget to save!
  user.save(function (err) {
      // todo: don't forget to handle
      return res.render("Personal_details___1.ejs", {token:token,id:id});
    });

  }) 
  return res.render("Personal_details___1.ejs", {token:token,id:id});

    
})

router.post('/personaldetails_1',auth.optional,(req,res,next) => { 
  var request = req.body.user
  //const { payload: { id } } = req;
  var id = req.body.user.id
  var token = request.token
  var body = {
    email:'user.email',
    city:'user.city',
    firstname:'user.firstname',
    gender:'user.gender',
    interest:request.interestandpreference,
    lastname:'user.lastname',
    postcode:'user.postcode',
    type:'user.type',
    dob:'user.dob'

  }
  //console.log(id)
  // token 
  // console.log(id)
  // console.log(JSON.stringify(req.headers));
  // console.log(id)
  // console.log(request)
  Users.findById(id, function (err, user) {
    if(!user) {
      return res.sendStatus(400);
    }
    //console.log(user.email);
    //res.json({ user: user.toAuthJSON() });
    // good idea to trim 
  var interest = request.interestandpreference
  // validate 
  // if (!firstname || !lastname) { // simplified: '' is a falsey
  //     return res.redirect('/personal_details_1'); // modified
  // }
  // no need for else since you are returning early ^
  user.interest = interest
  
  //update the property of bbody
  body.email=user.email
  body.city=user.city
  body.firstname=user.firstname
  body.gender=user.gender
  body.lastname=user.lastname
  body.postcode=user.postcode
  body.type=user.type
  body.dob=user.dob


  // don't forget to save!
  user.save(function (err) {
      // todo: don't forget to handle
      return res.render("dashboard.ejs",{body:body})

    });
    
   return  res.render("dashboard.ejs",{body:body})
  }) 


})

router.get('/dashboard',auth.optional,(req,res,next) => {
  res.render("dashboard.ejs",{})
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
      var body = {
        email:user.email,
        city:user.city,
        firstname:user.firstname,
        gender:user.gender,
        interest:user.interest,
        lastname:user.lastname,
        postcode:user.postcode,
        type:user.type,
        dob:user.dob

      }
      
      return res.render('dashboard.ejs',{body:body})
    }
    
    req.flash('notify', 'Redirect unsuccessful!')
    return res.redirect('/login')
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