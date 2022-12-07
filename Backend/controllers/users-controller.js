const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later", 500)
    );
  }
  res
    .status(200)
    .json({ Users: users.map((user) => user.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }
  const { name, email, password } = req.body;

  //Checking if user already exists.
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead", 422)
    );
  }

  //when the code gets here, user is validate to be not exists
  const newUser = new User({
    name: name,
    email: email,
    image:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    password: password,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError("Sigining up failed, please try again later", 500)
    );
  }

  res.status(201).json({ User: newUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later", 500)
    );
  }

  if (!existingUser || existingUser.password !== password) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 401)
    );
  }

  res
    .status(200)
    .json({
      message: "logged in",
      user: existingUser.toObject({ getters: true }),
    });
};

exports.getAllUsers = getAllUsers;
exports.signUp = signUp;
exports.login = login;
