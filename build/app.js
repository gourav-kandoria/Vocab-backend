"use strict";
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var validate_identity = require('./Routes/validate_identity');
var create_collection = require('./Routes/create_collection.js');
var app = express();
var logger = morgan('common');
app.use(logger);
mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
app.use('/account', validate_identity);
app.use('/createCollection', create_collection);
app.use(function (req, res) {
    res.end(400);
});
app.listen(3000);
