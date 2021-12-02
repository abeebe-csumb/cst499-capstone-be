require("dotenv").config();

var config_vars = {
  "username": process.env.DB_USER,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_DATABASE,
  "host": process.env.DB_HOST,
  "dialect": "mysql",
  connectionLimit: 10
};

module.exports = config_vars;