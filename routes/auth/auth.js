var express = require('express');
var app = express();
var url = require('url');
var config = require('../../config/config');
var router = express.Router();
var Users = require('../../model').Users;
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var htmlspecialchars = require('htmlspecialchars');
router.post('/', function(req, res) {
    // create a token
    //var users = config.clients;
    var email = htmlspecialchars(req.body.email);
    var password = htmlspecialchars(req.body.password);
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailTest = re.test(email) ? email : null;
    if (emailTest) {
        Users.doLogin(email, password).then(result => {
            var user = result;
            if (!user) {
                res.status(400).json({success: false, message: 'Authentication failed. Client not found.'});
                return;
            }
            var token = jwt.sign(user, config.secret, {
                expiresIn: '24h' // expires in 24 hours
            });

            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }, error => {
            res.status(400).send(error)
        })


    } else {
        res.status(400).send({error: "Email is incorrect"})
    }
})
module.exports = router;