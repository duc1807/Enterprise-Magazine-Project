require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");

// Import middleware authorization for admin
const { adminValidation } = require("../middleware/verification");

// Import database service
const { getAdminAccountByUsername } = require("../../utils/dbService/index");

const _ROUTER_ROLE = "admin";

/**
 * @method GET
 * @API /api/admin/authentication
 * @description Login API for admin
 * @param null
 * @returns
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 *      - data: Object
 *          - userInfo: Object
 *              + username: String
 *              + role_name: String
 *          - iat: Int
 *          - exp: Int
 * @note
 *      - (!!! CORS problems)
 */
router.get("/", adminValidation, (req, res) => {
  console.log("data", res.locals.data);
  const data = res.locals.data;

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff",
    "X-XSS-Protection",
    "1;mode=block"
  );

  res.status(200).json({
    status: res.statusCode,
    success: true,
    data: data,
  });
});

/**
 * @method POST
 * @API /api/admin/authentication/login
 * @description API route to signin the user
 * @param
 *    - username: String
 *    - password: String
 * @returns
 *    - status: statusCode
 *    - success: Boolean
 *    - message: String
 *    - user: Object
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Using Regex to test input contain special characters or not
  const regex = new RegExp(`[\s!@#$%^&*(),.\\?-_":{}|<>/=]`, "g");

  if (regex.test(username) || regex.test(password)) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Invalid input",
    });
  }

  // Check if username & password is invalid
  if (
    (!password && password == "") ||
    password == undefined ||
    username == "" ||
    username == undefined
  ) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Fill all fields",
    });
  } else {
    // Check if email is in database or not
    const query = getAdminAccountByUsername(username);

    await query
      .then(async (result) => {

        // Check if the username is found and the password is correct
        if (
          result.length &&
          (await bcrypt.compare(password, result[0].password))
        ) {

          // If success, create userInfo Object to pass to payload
          let userInfo = {};
          userInfo.username = result[0].username;
          userInfo.role_name = _ROUTER_ROLE;

          // Pass userInfo to payload
          const payload = {
            userInfo: userInfo,
          };

          // Generate token with userInfo payload
          const token = webToken.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "900s",
            }
          );

          // Storing Token in cookie, with httpOnly and secure set to true
          // (only allow token on secure website)
          res.cookie("Token", token, { httpOnly: true, /*secure: true*/ });

          res.status(200).json({
            status: res.statusCode,
            success: true,
            message: "Logged In successfully",
            user: userInfo,
          });
        } else {
          console.log("Signin failed");
          res.status(401).json({
            status: res.statusCode,
            success: false,
            message: "Invalid login information",
          });
        }
      })
      .catch((err) => {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      });

    // Old authentication way

    // if (queryResult.length) {
    //   // Success
    //   console.log("Signin successful");

    //   // Create userInfo Object
    //   let userInfo = {};
    //   userInfo.username = queryResult[0].username;
    //   userInfo.role_name = _ROUTER_ROLE;

    //   // Pass userInfo to payload
    //   const payload = {
    //     userInfo: userInfo,
    //   };

    //   // Generate token with userInfo payload
    //   const token = webToken.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "900s",
    //   });

    //   // Storing Token in cookie, with httpOnly and secure set to true
    //   // (only allow token on secure website)
    //   res.cookie("Token", token, { httpOnly: true /*secure: true*/ });

    //   res.status(200).json({
    //     status: res.statusCode,
    //     success: true,
    //     message: "Logged In successfully",
    //     userInfo: userInfo,
    //   });
    // } else {
    //   // Failed
    //   console.log("Signin failed");
    //   res.status(401).json({
    //     success: false,
    //     status: res.statusCode,
    //     message: "Invalid login information",
    //   });
    // }
  }
});

module.exports = router;
