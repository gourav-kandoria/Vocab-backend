"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bodyParser = require('body-parser');
var authenticator_1 = require("./../utilities/authenticator");
var router = express_1.default.Router();
function exit_from_here(res, error) {
    res.json({ "msg": "authorization failed", "error": error }).status(403).end();
    return;
}
router.use(bodyParser.json());
router.post('/:collection_name', function (req, res, next) {
    var token = req.headers.authorization;
    if (!token) {
        exit_from_here(res);
        return;
    }
    console.log("collection name: " + req.params.collection_name);
    console.log("token recieved: " + token);
    var promise = authenticator_1.verification(token);
    promise.then(function (result) {
        if (!result) {
            exit_from_here(res);
        }
        else {
            console.log(result);
            if (result.result == true) {
                res.locals.result = result;
                next();
            }
            else {
                exit_from_here(res, result.error);
            }
        }
    })
        .catch(function (err) {
        res.json({ "error": "Internal server error" }).end(500);
        return;
    });
});
router.post('/:collection_name', function (req, res, next) {
    var result = res.locals.result;
    res.json(result).end(200);
});
module.exports = router;
