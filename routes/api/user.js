const passport = require('passport');
const router = require('express').Router();
const mailer = require('../mailer');
const { User } = require('../../controllers/index.js');
const fs = require('fs');

router.use(passport.initialize());
router.use(passport.session());

//POST new user route (optional, everyone has access)
router.post('/create', (req, res, next) => {
    const { email, password, firstname, lastname, verifyPassword } = req.body;

    if (!email || !password || !firstname || !lastname) {
        return res.status(422).json({
            message: 'All fields are required!'
        });
    }

    if (password != verifyPassword) {
        return res.status(422).json({
            message: 'Passwords do not match!'
        });
    }

    User.findOne({ email: email })
        .then(isUser => {
            if (isUser) {
                return res.json({ "message": 'A user with that email already exists!' });
            }
            User.create({
                email: email,
                password: User.generateHash(password),
                token: User.generateJWT(email),
                firstname: firstname,
                lastname: lastname
            })
                .then(() => {
                    // send welcome email
                    fs.readFile('public/welcome-email.html', 'utf8', (err, data) => {
                        if (err) {
                            console.error(err)
                            return;
                          }
                          mailer.sendMail(email, 'Welcome to Sober.me!', data);
                    });
                    return res.redirect('/registerSuccess');
                })
                .catch((err) => { return res.json({ "message": "An Internal Error Occurred." }); })
        })
        .catch((err) => { return res.json({ "message": "An Internal Error Occurred." }); });
});

//POST login route (optional, everyone has access)
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({
            errors: {
                email: 'is required',
            },
        });
    }

    if (!password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    passport.authenticate('local', (err, passportUser, info) => {
        if (err) {
            return next(err);
        }

        if (passportUser) {
            req.login(passportUser, (err) => {
                // login event
                if (err) { return next(err); }
                res.cookie('XSRF-TOKEN', User.generateJWT(passportUser.email), { maxAge: 900000 });
                return res.redirect('/home');
            });
        }

        return res.json(info);

    })(req, res, next);
});

router.post('/forgotPassword', (req, res) => {
    const email = req.body.email;
    User.findOne({ email: email })
        .then((user) => {
            if (user) {
                const token = User.generateJWT(email);
                const resetURL = `${process.env.HOST}/resetPassword?email=${email}&token=${token}`;
                // console.log(resetURL);
                const htmlMessage = `<div><p>Password reset requested.` +
                    `</p><p>Follow <a href="${resetURL}">this link</a> to reset your password.</p>` +
                    `<p>This link will expire in two hours. Do not share this link with anyone.</p></div>`;
                mailer.sendMail(email, 'Password Reset Requested', htmlMessage);
            }
        })
    return res.json({ "message": 'If a user exists with that email, a password reset link will be sent out.' });
});

router.post('/reset', (req, res) => {
    const { email, password } = req.body;

    if (!password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }
    console.log(email);
    User.update({ email: email, password: User.generateHash(password) })
        .then((user) => {
            return res.json({ "message": "Password successfully reset." });
        })
        .catch((err) => { return res.json({ "message": "An Internal Error Occurred." }); });
});

module.exports = router;