/** Database setup for BizTime. */
require("dotenv").config()
console.log("database uri",process.env.DB_URI)
const { Client } = require("pg");

//const DB_URI ="postgresql:///biztime";
//let DB_URI;
//
//if (process.env.NODE_ENV === "test") {
//  DB_URI = "postgresql:///biztime_test";
//} else {
//  DB_URI = "postgresql:///biztime";
//}

const DB_URI = (process.env.NODE_ENV === "test")
  ? process.env.DB_URI_TEST
  : process.env.DB_URI;

let db = new Client({
  connectionString: DB_URI
  
});

db.connect();

module.exports = db;

