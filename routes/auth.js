// middleware
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization || req.cookies['XSRF-TOKEN'] || req.headers['xsrf-token'] || req.query.token;

    if (!token) {
        console.log("no cookie for you.");
        // return res.status(403).send("A token is required for authentication");
        return res.render("index");
    } try {
        jwt.verify(token, process.env.SECRET);
        console.log("Token verified");
    } catch (err) {
        console.log("Invalid Token");
        return res.render("login", { status_message: "Your session has expired. Please log in again to continue." });
    }
    return next();
}

module.exports = auth;