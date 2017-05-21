var express = require('express');
var config = require('../config/config');
var _ = require('lodash-node');

var router = express.Router();
var taskManagement_router = express.Router();

var taskManagement_apis = [{
    route: '/user',
    url: './user/users.js'
}, {
    route: '/auth',
    url: './auth/auth.js'
}];

module.exports = function(app) {
    app.use("", router);
    router.use(config.restApis.users.rest_url(), taskManagement_router);
    use(taskManagement_router, taskManagement_apis);
};

function use(root_router, apis) {
    _.each(apis, function(api) {
        var router = require(api.url);
        root_router.use(api.route, router);
    });
}