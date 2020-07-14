import jwt = require('jsonwebtoken');
import {User, UserSchema} from './../models/user'

interface myObject{
  'exist': boolean,
  'user'?: UserSchema,
}

var user_exist = async function(phone: String):Promise<myObject> {
  var ans:myObject= {'exist': false};
  await User.findOne({'phone': phone}, function(err : Error, result: UserSchema) {
    if(err) throw err;
    console.log('it crossed')
    if(result==null) ans={'exist': false};
    else ans = {'exist':true, 'user': result};
  });
  return ans;
};

var verification = async function(token : string):Promise<{ result: boolean; payload?: any; error?: any; 'user'?: any}> {

  const payload_base64Url:Array<string> = token.split('.');
  var obj:{result: boolean, payload?: any, error?: any, user?: any} = {result:true};

  var token = token.split(' ')[1];
  console.log('token: '+token);
  await jwt.verify(token,"mysecretkey",async function(err: any, decoded:any){
    if(err) {
      obj = {'result': false, 'payload': {}, 'error': err};
    }
    else {
      var phone:string = decoded['phone'];
      var res = await user_exist(phone);
      console.log(res);
      if(res.exist) {  
        obj = {'result': true, 'payload': decoded, 'user': res.user};
      }
      else {
        obj = {'result': false, 'payload': {}, 'error': Error('User already exist')};
      }
    }
    }
  );
  return obj;
};

export {verification, user_exist} 