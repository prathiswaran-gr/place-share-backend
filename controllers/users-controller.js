const { validationResult } = require("express-validator");
const UserModel = require("../models/user");
const HttpError = require("../models/httpError");

const getUsersList = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password").exec();
  } catch (error) {
    const err = new HttpError("Cannot retrieve the users list", 500);
    return next(err);
  }
  res
    .status(200)
    .json({ users: users.map((u) => u.toObject({ getters: true })) });
};
const userSignUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid input passed!!!", 422));
  }
  let hasUser;
  try {
    hasUser = await UserModel.findOne({ email: email });
    console.log(hasUser);
  } catch (error) {
    return next(new HttpError("Couldn't signup, please try again later!", 500));
  }
  if (hasUser) {
    return next(new HttpError("Email already exists, login instead!!", 422));
  }

  const newUser = new UserModel({
    name,
    email,
    password,
  });
  try {
    newUser.save();
  } catch (error) {
    return next(new HttpError("Couldn't signup, please try again later!", 500));
  }
  res.json({ message: "Signup Success" });
};
const userSignIn = async (req, res, next) => {
  const { email, password } = req.body;
  // const hasUser = DUMMY_USERS.find((user) => user.email === email);
  let hasUser;
  try {
    hasUser = await UserModel.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  if (!hasUser || password !== hasUser.password) {
    return next(new HttpError("User not available / Invalid credentials", 422));
  }
  res.json({ message: "Logged In" });
};

exports.getUsersList = getUsersList;
exports.userSignUp = userSignUp;
exports.userSignIn = userSignIn;
