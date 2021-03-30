require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");

const {
  getGuestAccountByUsernameAndPassword,
} = require("../../utils/dbService/index");
const { accessValidation } = require("../middleware/verification");
const _ROUTER_ROLE = "guest";

/**
 * @method GET
 * @API /api/authencation/guest
 * @description API for get guest account
 * @params null
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 * @notes
 */
router.get("/", accessValidation, (req, res) => {
  const data = res.locals.data;
  console.log("data: ", data);
  res.status(200).json({
    status: res.statusCode,
    success: true,
    user: data,
  });
});

/**
 * @method POST
 * @API /api/authentication/guest/login
 *  * @description API for login guest account
 * @params null
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 * @notes
 */

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Using Regex to test input contain special characters or not
  const regex = new RegExp(`[\s!@#$%^&*(),.\\?-_":{}|<>/=]`, "g");

  //  Error when test
  // if (regex.test(username) || regex.test(password)) {
  //   return res.status(401).json({
  //     status: res.statusCode,
  //     success: false,
  //     message: "Invalid input",
  //   });
  // }

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
    const query = getGuestAccountByUsernameAndPassword(username, password);

    await query
      .then(async (result) => {
        // Check if the username is found and the password is correct
        if (result.length) {
          // Check if account is enabled or not
          if (result[0].enabled) {
            // If success, create userInfo Object to pass to payload
            let userInfo = {};
            userInfo.username = result[0].guest_name;
            userInfo.role_name = _ROUTER_ROLE;
            userInfo.faculty_id = result[0].FK_faculty_id;
            // Pass userInfo to payload
            const payload = {
              userInfo: userInfo,
            };

            // Generate token with userInfo payload (expired in 30mins)
            const token = webToken.sign(
              payload,
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "1800s",
              }
            );

            // Storing Token in cookie, with httpOnly and secure set to true
            // (only allow token on secure website)
            res.cookie("Token", token, { httpOnly: true /*secure: true*/ });

            res.status(200).json({
              status: res.statusCode,
              success: true,
              message: "Logged In successfully",
              user: userInfo,
            });
          } else {
            res.status(401).json({
              status: res.statusCode,
              success: false,
              message: "Contact the manager to activate your account",
            });
          }
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
  }
});

/**
 * @method POST
 * @API /api/authentication/guest/logout
 * @description API for logging out guest account
 * @params null
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 * @notes
 */
router.post("/logout", (req, res) => {
  //get token from cookie
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(500).json({
      status: res.statusCode,
      success: false,
      message: "Bad request",
    });
  }
  // Clear token from cookie
  res.clearCookie("Token");

  // If token is cleared successful
  res.status(200).json({
    status: res.statusCode,
    success: true,
    message: "Signed out",
  });
});

module.exports = router;
