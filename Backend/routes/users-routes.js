const express = require("express");

const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersController.getAllUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty().withMessage("Name is empty, Must be filled"),
    check("email").normalizeEmail().isEmail().withMessage("Incorrect email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be as least 5 char"),
  ],
  usersController.signUp
);

router.post(
  "/login",
  check("email").normalizeEmail().isEmail().withMessage("Incorrect email"),
  usersController.login
);

module.exports = router;
