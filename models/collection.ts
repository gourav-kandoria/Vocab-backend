var mongoose = require('mongoose')

var Schema =  mongoose.Schema;

var collection = new Schema({
  "name": {
    type: String,
    required: true,
  },
  "words": {
    type: Array,
    required: true,
  }
});

var word = new Schema({
  "value": {
    type: String,
    minlength: 1,
    maxlength: 100,
    required: true
  },
  "sentences": {
    type: Array,
    required: true
  } 
});

var collection = mongoose.model('collection', collection);

var word = mongoose.model('Word', word);

module.exports = {collection, word};