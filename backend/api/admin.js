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
  createNewGuestAccount,
  updateGuestAccount,
  updateGuestAccountStatus,
  updateAccountStatus
} = require("../utils/dbService/index");

/**
 * @method GET
 * @api /api/admin/roles/
 * @description API route to get all roles
 * @params null
 * @return
 *    - status: Int,
 *    - success: Boolean
 *    - roles: Array[]
 */
router.get("/roles", async (req, res) => {
  // Get all roles information from database
  const query = getAllRolesInformation();

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        roles: result,
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
 * @method GET
 * @API /api/admin/accounts/:roleId/
 * @description API route to get all accounts by role
 * @params
 *    - roleId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - accounts: Array[]
 */
router.get("/accounts/:roleId", async (req, res) => {
  // Get accountId from params
  const { roleId } = req.params;

  // Get all accounts of roleId
  const query = getAccountsByRole(roleId);

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        accounts: result,
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
 * @method POST
 * @API /api/admin/accounts/
 * @description API route to create new internal account
 * @params
 *    - email: String
 *    - firstName: String
 *    - surName: String
 *    - roleId: Int
 *    - facultyId: Int
 * @return
 */
router.post("/accounts", async (req, res) => {
  const { email, firstName, surName, roleId, facultyId } = req.body;

  // Create account info Object
  const accountInfo = {
    email: email,
    roleId: roleId,
    facultyId: facultyId,
  };

  // Create new user account in database
  const query = createNewAccount(accountInfo);

  await query
    .then(async (result) => {
      // If account created successful, create acocunt detail Object
      const accountDetail = {
        firstName: firstName,
        surName: surName,
      };

      // Create user information
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
 * @method POST
 * @API /api/admin/guest-accounts/
 * @description API route to create new guest account
 * @params
 *    - username: String
 *    - password: String
 *    - facultyId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
router.post("/guest-accounts", async (req, res) => {
  // Get data from req.body
  const { username, password, facultyId } = req.body;

  // Create guest account info Object
  const guestAccountInfo = {
    username: username,
    password: password,
    facultyId: facultyId,
  };

  // Create new guest account in database
  const query = createNewGuestAccount(guestAccountInfo);

  await query
    .then((result) => {
      // If guest account inserted into database successful
      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Guest acccount created successfully",
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
 * @method PATCH
 * @API /api/admin/accounts/:accountId/
 * @description API route to update account status (enable/disable)
 * @params
 *    - accountId: Int
 *    - status: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
 router.patch("/accounts/:accountId", async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  // Get status from req.body
  const { status } = req.body;

  // Update guest account
  const query = updateAccountStatus(status, accountId);

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: `Account ${status ? "unactivated" : "activated"} successfully`,
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
 * @API /api/admin/accounts/:accountId/
 * @description API route to update internal account information
 * @params
 *    - email: String
 *    - firstName: String
 *    - surName: String
 *    - accountStatus: Int
 *    - facultyId: Int
 * @return
 * @notes
 *    - Wait for frontend solution (not implemented)
 *    - Check which fields will be updated ???????
 *    - where account_id will be passed ? req.body or req.params?
 *    - Temporaly unused !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
router.put("/accounts/:accountId", async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  // Get data from req.body
  const { email, firstName, surName, enabled, facultyId } = req.body;

  // Create account info Object
  const accountInfo = {
    email: email,
    enabled: enabled,
    facultyId: facultyId,
  };

  // Update account information
  const query = updateAccount(accountInfo, accountId);

  await query
    .then((result) => {
      // If account is updated successful in "Account" table
      // => Update in "Account_Info" table

      // Create account detail Object
      const accountDetail = {
        firstName: firstName,
        surName: surName,
      };

      // Update "Account_Info" in database
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

/**
 * @method PATCH
 * @API /api/admin/guest-accounts/:accountId/
 * @description API route to update guest account status (enable/disable)
 * @params
 *    - accountId: Int
 *    - status: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
 router.patch("/guest-accounts/:accountId", async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  // Get status from req.body
  const { status } = req.body;

  // Update guest account
  const query = updateGuestAccountStatus(status, accountId);

  await query
    .then((result) => {
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        message: `Guest account ${status ? "unactivated" : "activated"} successfully`,
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
 * @API /api/admin/guest-accounts/:accountId/
 * @description API route to update guest account information
 * @params
 *    - username: String
 *    - password: String
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
router.put("/guest-accounts/:accountId", async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  // Get data from req.body
  const { username, password } = req.body;

  // Create Object to store guest account information
  const guestAccountInfo = {
    username: username,
    password: password,
  };

  // Update guest account
  const query = updateGuestAccount(guestAccountInfo, accountId);

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Guest account updated successfully",
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
