const express = require("express");
const { check } = require("express-validator");
const route = express.Router();

const userController = require("../controllers/users-controller");

route.get("/", userController.getUsersList);

route.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("name").not().isEmpty(),
    check("password").isLength({ min: 6 }),
  ],
  userController.userSignUp
);

route.post("/login", userController.userSignIn);

module.exports = route;
