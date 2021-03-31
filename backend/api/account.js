const express = require("express");
const router = express.Router();

// Import modules from other file
const { gwAccountValidation } = require("./middleware/verification");
const { getAccountInfoById } = require("../utils/dbService/index");

/**
 * @method GET
 * @api /api/account/personal-information/
 * @description API route to get personal information
 * @params null
 * @return
 *    - AccountInfo_id: Int
 *    - first_name: String
 *    - sur_name: String
 *    - FK_account_id: Int
 */
router.get("/personal-information", gwAccountValidation, async (req, res) => {
  // Get current user information from middleware
  const data = res.locals.data
  
  // Get all roles information from database
  const query = getAccountInfoById(data.userInfo.account_id)
  
  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        userInformation: result[0],
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

module.exports = router;
