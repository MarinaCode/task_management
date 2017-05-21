var http = require('http'),
    express = require('express'),
    app = express(),
    config = require('./config/config'),
    routes = require('./routes'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens

// BodyParser Middleware
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit:50000 }));
// route middleware to verify a token
app.use(function(req, res, next) {
    if (req.originalUrl === "/management/api/v1/auth") {
        next();
        return ;
    }

    // check header or url parameters or post parameters for token
    var token = req.headers['authorization'];

    // decode token
    if (token && token.startsWith("Bearer ")) {

        // verifies secret and checks exp
        jwt.verify(token.split('Bearer ')[1], config.secret, function(err, user) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.user = user.result;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Authorization");
    next();
});
routes(app);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 403;
    next(err);
});

http.createServer(app).listen(config.port, function() {
    console.log('Listening on port ' + config.port);
});