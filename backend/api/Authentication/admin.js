require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");

// Import middleware authorization
const { adminValidation } = require('../middleware/verification')
const { authorizationAdmin } = require('../../utils/dbService/adminService')

// Using middleware
// router.use(adminValidation)

const _ROUTER_ROLE = "admin"

// Login API
router.get('/', adminValidation, (req, res) => {
  console.log("data", res.locals.data)
  const data = res.locals.data

  res.status(200).json({
    status: res.statusCode,
      success: true,
      user: data
  })
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    !password && password == "" ||
    password == undefined ||
    username == "" ||
    username == undefined
  ) {
    res.status(401).json({
      message: "Fill All Fields",
      status: res.statusCode,
    });
  } else {
    // Check mail in db or not
    const query = authorizationAdmin(username, password);
    let queryResult = []

    await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        messages: "Bad request",
      });
    });

    if(queryResult.length) {
      // Success
      console.log("Signin successful")

      let userInfo = {} 
      userInfo.username = queryResult[0].username
      userInfo.role = _ROUTER_ROLE 

      const token = webToken.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "900s",
      });

      res.cookie("Token", token, { httpOnly: true, /*secure: true*/  })

      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Logged In successfully",
        userInfo: userInfo,
      });

      // res.status(201).json({
      //   success: true,
      //   status: res.statusCode,
      //   username: queryResult[0].username
      // });
    }
    else {
      // Fail
      console.log("Signin failed")
      res.status(401).json({
        success: false,
        status: res.statusCode,
        message: "Invalid login information"
      });
    }
    
    userDetail = {
      email: "duc",
      password: "duc123",
    };
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
