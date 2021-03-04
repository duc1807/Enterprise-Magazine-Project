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
    // Check email is in db or not
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
      userInfo.role_name = _ROUTER_ROLE 

      const payload = {
        userInfo: userInfo
      }

      const token = webToken.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "900s",
      });

      res.cookie("Token", token, { httpOnly: true, /*secure: true*/  })

      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Logged In successfully",
        userInfo: userInfo,
      });
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
  }
});

module.exports = router;
