const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const LocalStrategy = require('passport-local');

// Create Local Strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done){
    // Verify the email and password, call 'done' with user
    // if it is the correct email and password
    // else, call 'done' with false

    User.findOne({email: email}, function(err, user){
        if(err) { return done(err); }
        if(!user) { return done(null, false); }

        // compare password, is 'password' is equal to 'user.password'
        user.comparePassword(password, function(err, isMatch){
            if(err) { return done(err); }
            if(!isMatch) { return done(null, false); }

            return done(null, user);
        });
    });
});

// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    /*
    See if the user ID in the payload exists in our database
    If it does, call 'done' with that 'user' object
    otherwise, call 'done' without a 'user' object
    */
    User.findById(payload.sub, function(err, user) {
        if(err) { return done(err, false); }

        if(user) {
            done(null, user);
        } else {
            done(null, false);
        }
    })
});

// Tell passport to use Strategy
passport.use(jwtLogin);
passport.use(localLogin);