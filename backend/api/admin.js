const express = require("express");
const { google } = require("googleapis");
const router = express.Router();

// Import modules from other file
const { adminValidation } = require("./middleware/verification");
const {
  createNewAccount,
  createAccountInformation,
  updateAccount,
  updateAccountInformation,
  getAllRolesInformation,
  getAccountsByRole,
} = require("../utils/dbService/index");

/**
 * @method GET
 * @api /api/admin/roles
 * @description API route to get accounts by role
 * @param
 *    - accountId: Int
 * @returns
 *    -
 */
router.get("/roles", async (req, res) => {
  // Get all roles information from database
  const query = getAllRolesInformation();

  await query
    .then((result) => {
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        roles: result,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

/**
 * @method POST
 * @API /api/admin/accounts
 * @description API route to create new account
 * @param
 *    - email: String
 *    - firstName: String
 *    - surName: String
 *    - roleId: Int
 *    - facultyId: Int
 * @returns
 */
router.post("/accounts", async (req, res) => {
  const { email, firstName, surName, roleId, facultyId } = req.body;

  const accountInfo = {
    email: email,
    roleId: roleId,
    facultyId: facultyId,
  };

  const query = createNewAccount(accountInfo);

  await query
    .then(async (result) => {
      const accountDetail = {
        firstName: firstName,
        surName: surName,
      };
      const query1 = createAccountInformation(accountDetail, result.insertId);

      await query1
        .then((result1) => {
          return res.status(200).json({
            status: res.statusCode,
            success: true,
            message: "Account created successfully",
          });
        })
        .catch((err) => {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

/**
 * @method GET
 * @API /api/admin/accounts/:roleId
 * @description API route to get all accounts by role
 * @param
 *    - roleId: Int
 * @returns
 *    - Wait for frontend solution (not implemented)
 *    - Check which fields will be updated ???????
 *    - where account_id will be passed ?? req.body or req.params?
 */
router.get("/accounts/:roleId", async (req, res) => {
  // Get accountId from params
  const { roleId } = req.params;
  
  const query = getAccountsByRole(roleId);

  await query
    .then((result) => {
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        accounts: result,
      });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

/**
 * @method PUT
 * @API /api/admin/accounts/:accountId
 * @description API route to update account
 * @param
 *    - email: String
 *    - firstName: String
 *    - surName: String
 *    - roleId: Int
 *    - facultyId: Int
 * @returns
 *    - Wait for frontend solution (not implemented)
 *    - Check which fields will be updated ???????
 *    - where account_id will be passed ? req.body or req.params?
 */
router.put("/accounts/:accountId", async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  const { email, firstName, surName, roleId, facultyId } = req.body;

  const accountInfo = {
    email: email,
    roleId: roleId,
    facultyId: facultyId,
  };

  const query = updateAccount(accountInfo, accountId);

  await query
    .then((result) => {
      const accountDetail = {
        firstName: firstName,
        surName: surName,
      };

      const query1 = updateAccountInformation(accountDetail, accountId);

      query1
        .then((result1) => {
          return res.status(200).json({
            status: res.statusCode,
            success: true,
            message: "Account updated successfully",
          });
        })
        .catch((err) => {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        });
    })
    .catch((err) => {
      console.log("Err: ", err);
      return res.status(501).json({
        status: res.statusCode,
        success: false,
        message: "Bad request",
      });
    });
});

module.exports = router;
