
require("dotenv").config()
console.log("database uri",process.env.DB_URI)
console.log("database uri",process.env.DB_URI_TEST)
const { Client } = require("pg");



const DB_URI = (process.env.NODE_ENV === "test")
  ? process.env.DB_URI_TEST
  : process.env.DB_URI;

let db = new Client({
  connectionString: DB_URI
  
});

db.connect();

module.exports = db;

