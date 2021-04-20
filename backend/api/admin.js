const express = require("express");
const router = express.Router();

// Import modules from other file
const { adminValidation } = require("./middleware/verification");
const {
  createNewAccount,
  createAccountInformation,
  getAllRolesInformation,
  getAccountsByRole,
  createNewGuestAccount,
  updateGuestAccount,
  updateGuestAccountStatus,
  updateAccountStatus,
  getAllGuestAccounts,
  deleteGuestAccountById,
  deleteAccountById,
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
router.get("/roles", adminValidation, async (req, res) => {
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
router.get("/accounts/:roleId", adminValidation, async (req, res) => {
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
 * @method GET
 * @API /api/admin/guest-accounts/
 * @description API route to get all guest accounts
 * @params
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - guestAccounts: Array[]
 */
router.get("/guest-accounts", adminValidation, async (req, res) => {
  // Get all accounts of roleId
  const query = getAllGuestAccounts();

  await query
    .then((result) => {
      res.status(200).json({
        status: res.statusCode,
        success: true,
        guestAccounts: result,
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
router.post("/accounts", adminValidation, async (req, res) => {
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
router.post("/guest-accounts", adminValidation, async (req, res) => {
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
router.patch("/accounts/:accountId", adminValidation, async (req, res) => {
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
      if (!!err) {
        console.log("Err: ", err);
        res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Not found",
        });
      }
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
router.patch(
  "/guest-accounts/:accountId",
  adminValidation,
  async (req, res) => {
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
          message: `Guest account ${
            status ? "unactivated" : "activated"
          } successfully`,
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log("Err: ", err);
          res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Not found",
          });
        }
      });
  }
);

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
router.put("/guest-accounts/:accountId", adminValidation, async (req, res) => {
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

/**
 * @method DELETE
 * @API /api/admin/accounts/:accountId/
 * @description API route to delete account
 * @params
 *    - accountId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
router.delete("/accounts/:accountId", adminValidation, async (req, res) => {
  // Get accountId from params
  const { accountId } = req.params;

  // Update guest account
  const query = deleteAccountById(accountId);

  await query
    .then((result) => {
      return res.status(200).json({
        status: res.statusCode,
        success: true,
        message: "Account deleted successful",
      });
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Not found",
        });
      }
    });
});

/**
 * @method DELETE
 * @API /api/admin/guest-accounts/:accountId/
 * @description API route to delete guest account
 * @params
 *    - accountId: Int
 * @return
 *    - status: Int
 *    - success: Boolean
 *    - message: String
 */
router.delete(
  "/guest-accounts/:accountId",
  adminValidation,
  async (req, res) => {
    // Get accountId from params
    const { accountId } = req.params;

    // Update guest account
    const query = deleteGuestAccountById(accountId);

    await query
      .then((result) => {
        return res.status(200).json({
          status: res.statusCode,
          success: true,
          message: "Guest account deleted successful",
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log("Err: ", err);
          res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Not found",
          });
        }
      });
  }
);

module.exports = router;
