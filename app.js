/** BizTime express application. */


const express = require("express");

const app = express();
const compRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
const industriesRoutes = require("./routes/industries");
const ExpressError = require("./expressError")

app.use(express.json());

app.use("/companies",compRoutes)
app.use("/invoices",invoiceRoutes)
app.use("/industries",industriesRoutes)
/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});



app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
