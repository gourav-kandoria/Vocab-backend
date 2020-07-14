import mongoose, {Schema, Document} from 'mongoose';
var {collection, word} = require('./collection');

interface UserSchema extends Document {
  phone: String,
  name?: String|null,
  collections: Array<typeof word>,
}

var an_object =  {
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  collections: {
    type: Array, 
    required: true, 
  }
};

var uschema= new Schema<UserSchema>(an_object);

var User = mongoose.model<UserSchema>('User', uschema);

export {User, UserSchema};