import express = require('express');
const { check, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

import {User, UserSchema} from './../models/user'

const accountSid = 'ACa1cd24576f04d6aacf511d14fd501e49';
const authToken = 'acaeba66b86101023c846fc4e845d50f';
const twilioClient = require('twilio')(accountSid, authToken);

var router = express.Router();
var otpLogger:any = {};

var generateOtp = function() {
  return "123456";
}

router.use(bodyParser.json());

router.use('/sendotp', function(req: express.Request,res: express.Response, next:any) {
  var otp = generateOtp();

  var phone = req.body.phone;

  twilioClient.messages
    .create({
      body: 'This is your OTP: ' +otp+ ' for Vocab Builder account set up',
      from: '+12075012725', 
      to: phone,
    }, function (err: any, message: any){
      if(err) {
        res.status(422);
        res.json({"result": false, "errors": [{"msg": err.message}]})
        res.end();
        return;
      }
      res.status(300);
      res.json({"result": true});
      res.end();
      otpLogger[phone] = otp; 

      setInterval(() => {
          otpLogger[phone] = undefined;  
        }, 300000);
      }
    );
}
);

router.use('/verifyOtp', function(req: any,res: any,next: any){
  var phone= req.body.phone;
  var otpClaimed = req.body.otp;

  if(otpLogger[phone]==otpClaimed && otpClaimed!=undefined) {
    var newUser = new User({phone: phone,    collections: []});
    // var newUser = new User();
    User.findOne({'phone': phone}, function(err : Error, result: UserSchema) {
      if(err) { 
        res.status(500).end('Internal Server Error');
      }
      else if(result==null) {
        newUser.save(function(er: any){
          if(er) {res.status(500).end('Internal Server Error');}
          else {
            res.locals.success = true; 
            res.locals.user = {phone: phone, name: null}; 
            next();}
        })
      }
      else {

        res.locals.success = true;
        res.locals.user= {phone: phone, name: result.name}; 
        next();

      }
    }
    );
    return;
  }
  else {
    res.locals.success = false;
    next();
  }
}
);

router.use('/verifyOtp', function(req: any,res: any,next: any){
    console.log(otpLogger);
    console.log(res.locals.success)
    if(res.locals.success) {
    jwt.sign({"phone": req.body.phone}, "mysecretkey", (err: Error, token: String) => { 
      if(err) {
        res.status(500).end("Internal Server Error");
        return;
      }
      res.status(200);
      res.json({"verified": true, "user": res.locals.user, "token": token});
      res.end();
      otpLogger[req.body.phone]=undefined;
    }
    );
    }
    else {
    res.status(400);
    res.json({"verified": false});
    res.end();
    }
});

module.exports = router;