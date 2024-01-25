const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const HttpError = require("./models/httpError");
const placeRoute = require("./routes/places-routes");
const userRoute = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placeRoute);
app.use("/api/users", userRoute);
app.use((req, res, next) => {
  next(new HttpError("Couldn't find the route", 404));
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    "mongodb+srv://USERNAME:PASSWORD@cluster0.yh8psnv.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database connection established successfully");
    app.listen(5000);
  })
  .catch((err) => console.log(err));
