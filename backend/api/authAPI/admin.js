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
 * @API /api/authentication/admin/
 * @description API for admin to get login credentials
 * @params null
 * @return
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
  // Get user info passed from middleware
  const data = res.locals.data;

  // Set header respones ????
  res.setHeader(
    "X-Content-Type-Options",
    "nosniff",
    "X-XSS-Protection",
    "1;mode=block"
  );

  res.status(200).json({
    status: res.statusCode,
    success: true,
    user: data,
  });
});

/**
 * @method POST
 * @API /api/authentication/admin/login
 * @description API route to signin the user
 * @params
 *    - username: String
 *    - password: String
 * @return
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
 * @API /api/authentication/admin/logout
 * @description API for logging out admin account
 * @params null
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 * @notes
 */
router.post("/logout", (req, res) => {
  const token = req.cookies["Token"];
  // If the token is not existed, throw 401 error
  if (!token) {
    return res.status(500).json({
      status: res.statusCode,
      success: false,
      message: "Bad request",
    });
  }

  res.clearCookie("Token");

  res.status(200).json({
    status: res.statusCode,
    success: true,
    message: "Signed out",
  });
});

// ========================================= API FOR TESTING
const {
  getDataBaseConnection,
} = require("../../utils/dbService/connection/dbConnection");

router.get("/all-accounts", (req, res) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Account`;

  db.query(sql, (err, result) => {
    if (!!err) {
      return res.status(500).json({
        status: res.statusCode,
        success: false,
        message: "Server error",
      });
    }
    db.end();
    return res.status(200).json({
      status: res.statusCode,
      success: true,
      accounts: result,
    });
  });
});

module.exports = router;
