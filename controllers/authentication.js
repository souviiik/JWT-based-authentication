const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user){
    const timastamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timastamp }, config.secret); // sub -> subject, iat -> issued at time
}

exports.signin = function(req, res, nxt){
    res.send({token: tokenForUser(req.user)});
}

exports.signup = function(req, res, nxt){
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(422).send({error: 'You must provide email and password'});
    }

    // See if a user with the given email exists
    User.findOne({ email: email }, function(err, existingUser){
        if(err) { return next(err); }

        // If a user with email does exist, return and error
        if(existingUser) {
            return res.status(422).send({ error: 'Email is in use.'});
        }

        // If a user with email does not exist, create and save user record
        const user = new User({
            email: email,
            password: password
        });

        user.save(function(err){
            if(err) { return next(err); }

            // Respond to request
            res.json({ token: tokenForUser(user) });
        });
    });
}