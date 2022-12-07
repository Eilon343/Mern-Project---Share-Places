const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS, POST, PATCH, DELETE"
  );

  next();
});

//Middleware for routes
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, mext) => {
  const Error = new HttpError("Could not find this route", 404);
  throw Error;
});

//Error handeling
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect("mongodb+srv://eilon343:7549649Ee@cluster0.ji30gc2.mongodb.net/mern")
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
