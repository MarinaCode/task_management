var express = require('express');
var url = require('url');
var router = express.Router();
var Users = require('../../model').Users;
var config = require('../../config/config');
var authorize = require('../../permission');
var htmlspecialchars = require('htmlspecialchars');

router.post('/', authorize.permit('superadmin'), function(req, res) {
    var email = htmlspecialchars(req.body.email),
        password = htmlspecialchars(req.body.password),
        firstName = htmlspecialchars(req.body.firstName),
        lastName = htmlspecialchars(req.body.lastName),
        role = htmlspecialchars(req.body.role);
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailTest = re.test(email) ? email : null;
    if (emailTest && password.trim().length) {
        Users.createUser(email, password, firstName, lastName, "member").then(function (result) {
            res.status(200).send(result);
        }, function(error) {
            res.status(400).send(error)
        })
    } else {
        res.status(200).send({error: "Email is not correct"})
    }
})

router.get('/', authorize.permit('superadmin'), function(req, res) {
    Users.getAllUsers().then(function (result) {
        res.status(200).send(result)
    })
})

router.get('/:id', authorize.permit('superadmin'), function(req, res) {
    var userId = req.params.id;
    Users.getUserById(userId).then(function (result) {
        res.status(200).send(result)
    }, function(err) {
        res.status(400).send(err)
    })
})

router.delete('/:id', authorize.permit('superadmin'), function(req, res) {
    var userId = req.params.id;
    Users.deleteUserById(userId).then(function (result) {
        res.status(200).send(result)
    }, function(err) {
        res.status(400).send(err)
    })
})

router.put('/:id', authorize.permit('superadmin', 'member'), function(req, res) {
    var userId = req.params.id;
    var email = htmlspecialchars(req.body.email),
        password = htmlspecialchars(req.body.password),
        firstName = htmlspecialchars(req.body.firstName),
        lastName = htmlspecialchars(req.body.lastName),
        role = htmlspecialchars(req.body.role);
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailTest = re.test(email) ? email : null;
    if (emailTest && password.trim().length) {
        Users.updateUserById(userId, email, password, firstName, lastName, role).then(function (result) {
            res.status(200).send(result)
        }, function(err) {
            res.status(400).send(err)
        })
    } else {
        res.status(400).send({error: "Email/password is not correct"})
    }
})

module.exports = router;