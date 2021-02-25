require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");

// Import middleware authorization
const { studentValidation } = require('../middleware/verification')
// const {  } = require('../../utils/dbService/studentService')

// Import modules from other files
const { getAuthClient, getUserProfile, getAuthUrl } = require("../../utils/auth");

// Using middleware
router.use(studentValidation)

const _ROUTER_ROLE = "student"

// Login API
router.get('/login',(req, res) => {
  console.log("data", res.locals.data)
  const data = res.locals.data
  // res.cookie("Token", accessToken, { httpOnly: true })
  res.status(200).json({
    status: res.statusCode,
      success: true,
      role: _ROUTER_ROLE,
      data: data
  })
})

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
