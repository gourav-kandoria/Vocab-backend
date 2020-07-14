"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var _a = require('express-validator'), check = _a.check, validationResult = _a.validationResult;
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var user_1 = require("./../models/user");
var accountSid = 'ACa1cd24576f04d6aacf511d14fd501e49';
var authToken = 'acaeba66b86101023c846fc4e845d50f';
var twilioClient = require('twilio')(accountSid, authToken);
var router = express.Router();
var otpLogger = {};
var generateOtp = function () {
    return "123456";
};
router.use(bodyParser.json());
router.use('/sendotp', function (req, res, next) {
    var otp = generateOtp();
    console.log("crossed here");
    var phone = req.body.phone;
    console.log("crossed here");
    console.log('phone: ' + phone);
    twilioClient.messages
        .create({
        body: 'This is your OTP: ' + otp + ' for Vocab Builder account set up',
        from: '+12075012725',
        to: phone,
    }, function (err, message) {
        if (err) {
            res.status(422);
            res.json({ "result": false, "errors": [{ "msg": err.message }] });
            res.end();
            return;
        }
        res.status(300);
        res.json({ "result": true });
        res.end();
        otpLogger[phone] = otp;
        console.log(otpLogger);
        setInterval(function () {
            otpLogger[phone] = undefined;
        }, 300000);
    });
});
router.use('/verifyOtp', function (req, res, next) {
    var phone = req.body.phone;
    var otpClaimed = req.body.otp;
    if (otpLogger[phone] == otpClaimed && otpClaimed != undefined) {
        var newUser = new user_1.User({ phone: phone, collections: [] });
        // var newUser = new User();
        user_1.User.findOne({ 'phone': phone }, function (err, result) {
            if (err) {
                res.status(500).end('Internal Server Error');
            }
            else if (result == null) {
                console.log("i was null");
                newUser.save(function (er) {
                    if (er) {
                        console.log('it caused');
                        res.status(500).end('Internal Server Error');
                    }
                    else {
                        res.locals.success = true;
                        res.locals.user = { phone: phone, name: null };
                        next();
                    }
                });
            }
            else {
                console.log("I existed\n");
                console.log('newUser.phone: ' + newUser.phone);
                res.locals.success = true;
                res.locals.user = { phone: phone, name: result.name };
                next();
            }
        });
        return;
    }
    else {
        console.log("It came here\n");
        res.locals.success = false;
        next();
    }
});
router.use('/verifyOtp', function (req, res, next) {
    console.log(otpLogger);
    console.log(res.locals.success);
    if (res.locals.success) {
        jwt.sign({ "phone": req.body.phone }, "mysecretkey", function (err, token) {
            if (err) {
                res.status(500).end("Internal Server Error");
                return;
            }
            res.status(200);
            res.json({ "verified": true, "user": res.locals.user, "token": token });
            res.end();
            otpLogger[req.body.phone] = undefined;
        });
    }
    else {
        res.status(400);
        res.json({ "verified": false });
        res.end();
    }
});
module.exports = router;
