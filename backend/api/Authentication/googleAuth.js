require("dotenv").config();

const express = require("express");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const multer = require("multer");
const { google, Auth } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const path = require("path");

// Import modules from other files
const {
  getAuthClient,
  getUserProfile,
  getAuthUrl,
} = require("../../utils/auth");

// Middleware authentication
const {
  loginValidation,
  gwAccountValidation,
} = require("../middleware/verification");

// Import database service
const { getAccountByEmail } = require("../../utils/dbService/accountService");

// Constants
const _GW_GROUP_ROLE_ID = [1, 2, 3];

// ****************** FOR STUDENTS AND MANAGERS ****************** \\
//
//
//
//
// ****************** FOR STUDENTS AND MANAGERS ****************** \\

/**
 * @method GET
 * @description Get information for manager, coordinator and student
 * @params null
 * @returns
 *      - status: Int
 *      - success: Boolean
 *      - data: Object
 *          - userInfo: Object
 *                + account_id: Int
 *                + email: String
 *                + FK_role_id: Int
 *                + FK_faculty_id: Int
 *                + role_id: Int
 *                + role_name: String
 *                + faculty_id: Int
 *                + faculty_name: String
 *                + faculty_folderId: String
 *          - goolgeAccountInfo: Object
 *          - iat: Int
 *          - exp: Int
 * @notes
 */
router.get("/", gwAccountValidation, (req, res) => {
  // Get data return from middleware
  const data = res.locals.data;

  res.status(200).json({
    status: res.statusCode,
    success: true,
    data: data,
  });
});


/**
 * @method POST
 * @description Login API for student and staff
 * @params
 *      - id_token: Token from client request headers
 * @return
 *      - status: Int
 *      - success: Boolean
 *      - message: String
 *      - user: Object
 *          - userInfo: Object
 *              + username: String
 *              + role_name: String
 *          - oAuthInfo: Object
 *              +
 * @notes
 *      - (!!! CORS problems)
 *      - Function verify doesnt have resolve reject?
 */
router.post("/login", async (req, res) => {
  const { id_token } = req.body;
  let email = "";
  let oauthUser = undefined

  // Check if id_token is exist or not
  if(!id_token) {
    return res.status(500).json({
      status: res.statusCode,
      success: false,
      message: "Bad request"
    })
  }

  // STEP 1: Verify the token from client POST request
  const oAuth2Client = getAuthClient();

  // Generate new client service
  const client = new OAuth2Client(oAuth2Client._clientId, oAuth2Client._clientSecret);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: oAuth2Client._clientId,
    });

    // Get userInfo from payload if id_token is valid
    const payload = ticket.getPayload();

    // Only storing 
    oauthUser = payload["sub"];

    // Get email of user and assign to 'email'
    email = "test"; ////////// ============================= Test

    console.log("User: ", user);
  }

  // Return err in catch
  await verify()
    // .then(() => {
    //   console.log("token con hieu luc");
    //   // Get user info
    //   oauth2.userinfo.get((err, response) => {
    //     if (err) throw err;

    //     console.log(response.data);

    //     let name = response.data.name;
    //     let pic = response.data.picture;

    //     res.render("success", { name: name, pic: pic, success: false });

    //     // res.status(201).json({
    //     //   success: true,
    //     // });
    //   });
    // })
    .catch((err) => {
      console.error(err);
      return res.status(401).json({
        success: false,
        messgages: "Token expired, please login",
      });
    });

  // STEP 2: Check if the account is in the database or not (info from token_id)
  console.log("Chay vao query") // Testing code
  const query = getAccountByEmail(email);

  let queryResult = [];

  await query
    .then((result) => {
      console.log("result: ", result);
      queryResult = result;

      // STEP 3: If user is valid, assign the data to payload and signing token
      if (queryResult.length) {
        let _data = {};
        _data.userInfo = result[0];
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
          message: "Signed in successfully",
          success: true,
          user: {
            userInfo: _data.userInfo,
            oAuthInfo: _data.oAuthInfo,
          },
        });
      } else {
        // If the user not found in database -> throw permission required notification
        res.status(401).json({
          messages: "This account doesn't have permission to the website!",
        });
      }
    })
    // Catch database error
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(500).json({
        messages: "Server error",
      });
    });
});


/** 
 * @method POST
 * @description API for logging out user
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

// ================================================== OLD CODE

router.get("/test", async (req, res) => {
  let userDetail = {};
  userDetail.username = "duc";
  userDetail.role = "1";

  const token = webToken.sign(userDetail, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "900s",
  });

  res.cookie("Token", token, { httpOnly: true /*secure: true*/ });

  res.status(200).json({
    status: res.statusCode,
    message: "Logged In successfully",
    success: true,
    userDetail: userDetail,
    path: "/",
  });
});

router.get("/google/callback", (req, res) => {
  const code = req.query.code;

  if (code) {
    // Get access token
    let oAuth2Client = getAuthClient();

    const client = new OAuth2Client(oAuth2Client._clientId);

    oAuth2Client.getToken(code, async (err, tokens) => {
      if (err) {
        console.log("Authentication error");
        console.log(err);
        res.status(401).json({
          messages: "error",
        });
      } else {
        console.log("Authentication successful");
        console.log(tokens);

        await client
          .verifyIdToken({
            idToken: tokens.id_token,
            audience: oAuth2Client._clientId,
          })
          .then((result) => {
            let userDetail = { gapiToken: {} };
            console.log("testtt", tokens);
            userDetail.gapiToken.id_token = tokens.id_token;
            userDetail.gapiToken.access_token = tokens.access_token;
            userDetail.gapiToken.expiry_date = tokens.expiry_date;
            userDetail.info = result.payload;
            userDetail.role = "student";

            const token = webToken.sign(
              userDetail,
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "10s",
              }
            );

            res.cookie("Token", token, { httpOnly: true /*secure: true*/ });

            // Redirect to get Login
            res.redirect("/api/student/login");
          })
          .catch((err) => console.log("err", err));

        // oAuth2Client.setCredentials(tokens);

        // res.status(200).json({
        //   messages: "success"
        // });

        // res.redirect('/')
      }
    });
  }
});

// router.get("/download", (req, res) => {
//   // 1yEnOfJzvD9nrlSQVbJEHLwIHqm9QzgKu

//   // let oAuth2Client = getAuthClient();

//   // const drive = google.drive({
//   //   version: "v2",
//   //   auth: oAuth2Client,
//   // });

//   // var dest = fs.createWriteStream("./download_temp/test.png");
//   // var fileId = "1srUPEQ8YNP4R7ln06I7w1VMmfA9abqiq";

//   // drive.files
//   //   .get({
//   //     fileId: fileId,
//   //     alt: "media",
//   //   }, {responseType: 'stream'}, (err, res) => {
//   //     console.log("data: ", res)
//   //     res.data
//   //  .on('end', () => {
//   //     console.log('Done');
//   //  })
//   //  .on('error', err => {
//   //     console.log('Error', err);
//   //  })
//   //  .pipe(dest);
//   //   })

//   var filepath = path.join(__dirname, '../download_temp') + '/' + 'test.png'
//   console.log(filepath)
//   res.sendFile(filepath)
//   fs.unlinkSync(filepath)
// });

// ****************** FOR ADMIN ****************** \\
//
//
//
//
// ****************** FOR ADMIN ****************** \\

const {
  getAdminAccountByUsername,
} = require("../../utils/dbService/adminService");

// router.get("/admin", (req, res) => {
//   res.json({
//     page: "adminlogin",
//   });

//   // res.render('admin')
// });

// router.post("/admin", async (req, res) => {
//   const { username } = req.body;

//   const query = getAdminAccountByUsername(username);

//   let queryResult = [];

//   // **** For test
//   let password = "f5bb0c8de146c67b44babbf4e6584cc0";

//   await query
//     .then((result) => {
//       console.log("result: ", result);
//       queryResult = result;
//     })
//     .catch((err) => {
//       console.log("Err: ", err);
//       return res.status(501).json({
//         messages: "Bad request",
//       });
//     });

//   if (queryResult.length && queryResult[0].password == password) {
//     // Success
//     console.log("tk dung");
//     res.status(201).json({
//       success: true,
//       status: res.statusCode,
//       username: queryResult[0].username,
//     });
//   } else {
//     // Fail (Wrong password)
//     console.log("sai mk");
//     res.status(401).json({
//       success: false,
//       status: res.statusCode,
//       message: "Invalid login information",
//     });
//   }
// });

// ========================================== OLD CODE ================================
// router.get("/", async (req, res) => {
//   const oAuth2Client = getAuthClient();

//   console.log(
//     "Credentials: ",
//     Boolean(Object.keys(oAuth2Client.credentials).length)
//   );

//   if (
//     oAuth2Client.credentials &&
//     !Object.keys(oAuth2Client.credentials).length &&
//     oAuth2Client.credentials.constructor == Object
//   ) {
//     var url = getAuthUrl();
//     console.log(url);

//     // res.json({
//     //   success: false,
//     //   url: url
//     // })

//     res.render("index", { url: url, clientID: oAuth2Client._clientId });
//   } else {
//     var oauth2 = google.oauth2({
//       auth: oAuth2Client,
//       version: "v2",
//     });
//     // const data = oauth2.tokeninfo();
//     // const token = data.config.headers.Authorization.split(" ")[1];
//     const tokenInfo = oAuth2Client.credentials;

//     console.log("TOKENNNNN : ", tokenInfo);
//     const token_old =
//       "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZkYjQwZTJmOTM1M2M1OGFkZDY0OGI2MzYzNGU1YmJmNjNlNGY1MDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3MDE3Mjg0NDg0MzctcTVjdWx0c2p0ZjNoajQyZGJlaGg2ZHZmZzE1ZTlrM2UuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTI2MDY3NTk4MzA4NTQxMTkwMjQiLCJhdF9oYXNoIjoiVFBuS2ZLTERoRENXM0ZfUURtTUk5dyIsIm5hbWUiOiJEdWMgRHVjIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tQk12MGRta3FNQVUvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbmxNbVJlVGx0RmFqcFBqYldnY2l2LTZ3bXI1QS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiRHVjIiwiZmFtaWx5X25hbWUiOiJEdWMiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTYxMzkxODk4NCwiZXhwIjoxNjEzOTIyNTg0fQ.b7SLAkjUBixbbm26jAirJVMKd-PGS_iwKRhSs5Xs0E_xgvcKjLq1iSyVOBWPeS_v-bAOcKqRymJHgr8BrMAYBJQaV9eM_n7-MBoz9Cij3ZTSH3gniQztxUcHPgPfnTmlsC8r6tfRjbeiH1Gh9Xae6cMRqEbAJX2gowKvEb8hJFUR9D3Jof4Qn7EmTcRCPvDX0I3Uwts2NkSL-TngG6j7Dlkj_0cIknevpHDP7WphTEHLLsRB2UvM4Xcy88dYULUIrSfPAgNfNGrIRTGTGZWEfGrcD9zVZ5I_cdS5ZA525wOPWZgegd3VAXzjkwxbqZRa_9MWjWllx1AH8i8E1GeWKA";
//     // await oAuth2Client.revokeToken(token_old).then(console.log("ok go token"))

//     const client = new OAuth2Client(oAuth2Client._clientId);

//     async function verify() {
//       const ticket = await client.verifyIdToken({
//         idToken: tokenInfo.id_token,
//         audience: oAuth2Client._clientId,
//       });
//       // .then((value) => {
//       //   resolve(value);
//       // })
//       // .catch((err) => {
//       //   reject(err);

//       //   //   res.sendStatus(401).json({
//       //   //     meesages: "expired token",
//       //   //   });
//       // });

//       const payload = ticket.getPayload();
//       const userid = payload["sub"];

//       console.log("Userid: ", userid);
//     }

//     verify()
//       .then(() => {
//         console.log("token con hieu luc");
//         // Get user info
//         oauth2.userinfo.get((err, response) => {
//           if (err) throw err;

//           console.log(response.data);

//           let name = response.data.name;
//           let pic = response.data.picture;

//           res.render("success", { name: name, pic: pic, success: false });

//           // res.status(201).json({
//           //   success: true,
//           // });
//         });
//       })
//       .catch((err) => {
//         console.log("err o ngoai cung: ", err);
//         res.status(401).json({
//           success: false,
//           messgages: "Token expired, please login",
//         });
//         return;
//       });
//   }
// });

module.exports = router;
