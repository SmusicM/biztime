const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM industries`);

    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `INSERT INTO industries(code,industry)
            VALUES($1,$2)
            RETURNING*`,
      [req.body.code, req.body.industry]
    );
    return res.status(201).json({ industries: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
