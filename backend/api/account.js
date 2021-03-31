const express = require("express");
const router = express.Router();

// Import modules from other file
const { gwAccountValidation } = require("./middleware/verification");
const {
  getAccountInfoById,
  updateAccountInfoById,
} = require("../utils/dbService/index");

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
  const data = res.locals.data;

  // Get all roles information from database
  const query = getAccountInfoById(data.userInfo.account_id);

  await query
    .then((account) => {
      const userInfo = {
        AccountInfo_id: account[0].AccountInfo_id || undefined,
        first_name: account[0].first_name || "",
        sur_name: account[0].sur_name || "",
        FK_account_id: account[0].FK_account_id
      };

      res.status(200).json({
        status: res.statusCode,
        success: true,
        userInformation: userInfo,
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

/**
 * @method PUT
 * @api /api/account/update-information/
 * @description API route to update personal information
 * @params
 *    - accountId: Int
 *    - firstName: String
 *    - surName: String
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message:  String
 */
router.put("/update-information", gwAccountValidation, async (req, res) => {
  // Get data from req.body
  const { firstName, surName } = req.body;

  // Get current user information from middleware
  const data = res.locals.data;

  // Create accountInfo Object
  const accountInfo = {
    firstName: firstName,
    surName: surName,
  };

  // Get all roles information from database
  const query = updateAccountInfoById(accountInfo, data.userInfo.account_id);

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Account information updated successfully",
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
