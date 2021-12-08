const { User, Activity } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

module.exports = {
    create(data) {
        return User
            .create({
                email: data.email,
                password: data.password,
                token: data.token,
                firstname: data.firstname,
                lastname: data.lastname
            })
            .then(function (user) {
                console.log(user.email + ' sucessfully added to the database.');
                return user;
            })
            .catch(error => console.log(error));
    },
    update(data) {
        return User
            .update(
                { password: data.password },
                { where: { email: data.email } })
            .then(function (user) {
                console.log('Password updated.')
                return user;
            })
            .catch(error => console.log(error));
    },
    updatePhoto(data) {
        return User
            .update(
                { profileImage: data.password },
                { where: { id: id } })
            .then(function (user) {
                console.log('Profile Image updated.')
                return user;
            })
            .catch(error => console.log(error));
    },
    findOne(data) {
        return User
            .findOne({
                where: { email: data.email }
            })
            .then(function (user) { return user; })
            .catch(error => console.log(error));
    },
    findById(data) {
        return User
            .findOne({
                where: { id: data.id }
            })
            .then(function (user) { return user; })
            .catch(error => console.log(error));
    },
    generateHash(password) {
        return bcrypt.hashSync(password, saltRounds);
    },
    async validatePassword(password, userPassword) {
        return await bcrypt.compare(password, userPassword);
    },
    generateJWT(userEmail) {
        return jwt.sign({
            email: userEmail,
        }, process.env.SECRET,
            {
                expiresIn: "2h",
            });
    },
    toAuthJSON(userEmail) {
        return {
            email: userEmail,
            token: this.generateJWT()
        };
    }
};