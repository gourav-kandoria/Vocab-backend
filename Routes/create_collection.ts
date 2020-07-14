
import express from 'express';
var bodyParser = require('body-parser');
import {verification} from './../utilities/authenticator'

var router = express.Router();

function exit_from_here(res: any, error?: Error) {
    res.json({"msg": "authorization failed", "error": error}).status(403).end();
    return;
} 

router.use(bodyParser.json());

router.post('/:collection_name',function(req: express.Request, res: express.Response, next: any){
  const token = req.headers.authorization;
  if(!token) {exit_from_here(res); return;}

  let promise:Promise<{ result: boolean; payload?: any; error?: any; }> = verification(token);
  promise.then(function(result:any){
    if(!result){
      exit_from_here(res);
    }
    else {
      console.log(result);
      if(result.result==true) {
        res.locals.result = result;
        next();
      }
      else {
        exit_from_here(res, result.error);
      }
    }
  })
  .catch(function(err){
    res.json({"error": "Internal server error"}).end(500);
    return;
  });
});

router.post('/:collection_name',function(req: any,res: any,next: any){
  var result = res.locals.result; 
  res.json(result).end(200);
});



module.exports = router;