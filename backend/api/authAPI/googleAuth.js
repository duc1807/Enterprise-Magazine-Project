require("dotenv").config();

const express = require("express");
const router = express.Router();
const webToken = require("jsonwebtoken");
const async = require("async");
const { OAuth2Client } = require("google-auth-library");

// Import modules from other files
const { getAuthClient } = require("../../utils/auth");

// Middleware authentication
const { gwAccountValidation } = require("../middleware/verification");

// Import database service
const { getAccountByEmail } = require("../../utils/dbService/accountService");

/**
 * @method GET
 * @API /api/authentication/
 * @description Get login credentials for manager, coordinator and student
 * @params null
 * @returns
 *    - status: Int
 *    - success: Boolean
 *    - data: Object
 *        - userInfo: Object
 *              + account_id: Int
 *              + email: String
 *              + FK_role_id: Int
 *              + FK_faculty_id: Int
 *              + role_id: Int
 *              + role_name: String
 *              + faculty_id: Int
 *              + faculty_name: String
 *              + faculty_folderId: String
 *        - goolgeAccountInfo: Object
 *        - iat: Int
 *        - exp: Int
 * @notes
 */
router.get("/", gwAccountValidation, (req, res) => {
  // Get data return from middleware
  const data = res.locals.data;

  res.status(200).json({
    status: res.statusCode,
    success: true,
    user: data,
  });
});

/**
 * @method POST
 * @API /api/authentication/login/
 * @description Login API for student, staff and manager
 * @params
 *    - id_token: Token from client request cookies
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 *    - user: Object
 *        - userInfo: Object
 *            + username: String
 *            + role_name: String
 *        - oAuthInfo: Object
 *          
 */
router.post("/login", async (req, res) => {
  const { id_token } = req.body;
  // Create oauthUser variable to store user information from payload
  let oauthUser = undefined;

  // Check if id_token is exist or not
  if (!id_token) {
    return res.status(500).json({
      status: res.statusCode,
      success: false,
      message: "Bad request",
    });
  }

  // STEP 1: Verify the token from client POST request
  const oAuth2Client = getAuthClient();

  // Generate new client service
  const client = new OAuth2Client(
    oAuth2Client._clientId,
    oAuth2Client._clientSecret
  );

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: oAuth2Client._clientId,
    });

    // Get userInfo from payload if id_token is valid
    const payload = ticket.getPayload();

    // Get oauthUser information from payload
    oauthUser = payload;

    console.log("User: ", payload);
  }

  // Promise response handling
  await verify()
    .catch((err) => {
      console.error(err);
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Token expired, please login",
      });
    });

  // STEP 2: Check if the account is in the database or not (info from token_id)
  const query = getAccountByEmail(oauthUser.email);

  await query
    .then((account) => {
      console.log("result: ", account);

      // STEP 3: If user is valid, assign the data to payload and signing token
      if (account.length) {
        // Check if account is enabled or not
        if (account[0].enabled) {
          let _data = {};
          _data.userInfo = account[0];
          _data.oAuthInfo = oauthUser;

          const token = webToken.sign(_data, process.env.ACCESS_TOKEN_SECRET, {
            // Token will expire in 30mins
            expiresIn: "1800s",
          });

          // STEP 4: Send token to client cookie
          res.cookie("Token", token, { httpOnly: true /*secure: true*/ });

          // STEP 5: Return userInfo if login successful
          res.status(200).json({
            status: res.statusCode,
            success: true,
            message: "Signed in successfully",
            user: {
              userInfo: _data.userInfo,
              oAuthInfo: _data.oAuthInfo,
            },
          });
        } else {
          res.status(401).json({
            status: res.statusCode,
            success: false,
            message: "Contact the manager to activate your account",
          });
        }
      } else {
        // If the user not found in database -> throw permission required notification
        res.status(401).json({
          status: res.statusCode,
          success: false,
          message: "This account doesn't have permission to the website!",
        });
      }
    })
    // Catch database error
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(500).json({
        status: res.statusCode,
        success: false,
        message: "Server error",
      });
    });
});

/**
 * @method POST
 * @API /api/authentication/logout/
 * @description API for logging out user
 * @params null
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
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

module.exports = router;
