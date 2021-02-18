const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
require("dotenv").config();

// Register APi
router.post("/register", function (req, res) {
  const { username, password, email } = req.body;
  if (
    username == undefined ||
    username == "" ||
    password == undefined ||
    password == "" ||
    email == undefined ||
    email == ""
  ) {
    res.status(401).json({
      message: "Fill All Fields",
      status: res.statusCode,
    });
  } else {
    // Code
    res.status(200).json({
      message: "Success",
      status: res.statusCode,
    });
  }
});

// Login API
router.post("/login", function (req, res) {
  const { email, password } = req.body;

  if (
    password == "" ||
    password == undefined ||
    email == "" ||
    email == undefined
  ) {
    res.status(401).json({
      message: "Fill All Fields",
      status: res.statusCode,
    });
  } else {
    // check mail in db or not
    userDetail = {
      email: "duc",
      password: "duc123",
    };

    const token = webToken.sign(userDetail, process.env.SECRET_KEY, {
      expiresIn: "60s",
    });
    res.status(200).json({
      message: "Logged In successfully",
      status: res.statusCode,
      token,
    });
    // if mail is there check the password is correct or wrong
  }
});

// get UserProfile API
router.get("/profile", function (req, res) {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.substr("Bearer".length + 1);

    webToken.verify(token, process.env.secret_key, (err, user) => {
      if (user) {
        return res.status(200).json({
          status: res.statusCode,
          data: user,
          message: "success",
        });
      }
      res.status(401).json({
        status: res.statusCode,
        message: "please Login",
      });
    });
  } else {
    res.status(401).json({
      status: res.statusCode,
      message: "Please Login",
    });
  }
});

module.exports = router;
