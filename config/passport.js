const passport = require('passport');
const LocalStrategy = require('passport-local');

const { User } = require('../controllers/index.js');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email })
        .then(async (user) => {
            if (!user) {
                return done(null, false, { "message": 'User with that email does not exist!' });
            }
            if (!await User.validatePassword(password, user.password)) {
                return done(null, false, { "message": 'Incorrect password entered!' });
            }
            return done(null, user);
        })
        .catch(done);
}));

passport.serializeUser(function (user, done) {
    console.log('Serialized user');
    done(null, user.email);
});

passport.deserializeUser(function (email, done) {
    console.log("Deserializing user...");
    User.findOne({ email: email })
        .then((user) => {
            done(null, user);
        })
        .catch(done);
});