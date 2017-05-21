// middleware for doing role-based permissions
var _ = require('lodash');
var permit = function (...allowed) {
    let isAllowed = role => _.indexOf(allowed, role) > -1;

    // return a middleware
    return (req, res, next) => {
        if (req.user && isAllowed(req.user.role))
            next(); // role is allowed, so continue on the next middleware
        else {
            res.status(403).json({message: "User is Forbidden"}); // user is forbidden
        }
    }
};

module.exports.permit = permit;