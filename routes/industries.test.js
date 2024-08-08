process.env.NODE_ENV = "test";
require("dotenv").config({ path: ".env.test" });

const request = require("supertest");
const slugify = require("slugify");

const app = require("../app");
const db = require("../db");
