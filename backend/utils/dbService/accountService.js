const { getDataBaseConnection } = require("./connection/dbConnection");

const _TABLE_ACCOUNT = "Account";

const getAccountByEmail = async (email) => {
  let db = getDataBaseConnection();

  // Get correct email with role and faculty information (INNER JOIN)
  const sql = `SELECT *, Role.role_name, Faculty.faculty_name
               FROM ${_TABLE_ACCOUNT} 
               INNER JOIN Role
               ON ${_TABLE_ACCOUNT}.FK_role_id = Role.role_id
               INNER JOIN Faculty ON ${_TABLE_ACCOUNT}.FK_faculty_id = Faculty.faculty_id
               WHERE ${_TABLE_ACCOUNT}.email = '${email}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const updateAccountInfoById = async (accountInfo, accountId) => {
  // Get data from accountInfo Object
  const { firstName, surName } = accountInfo;

  let db = getDataBaseConnection();

  // Get correct email with role and faculty information (INNER JOIN)
  const sql = `UPDATE Account_Info
              SET 
              first_name = '${firstName}', 
              sur_name = '${surName}'
              WHERE FK_account_id = ${accountId}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const getAllGuestAccounts = async (username) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Guest`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const deleteAccountById = (accountId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Account
              WHERE account_id = ${accountId}`;

  const sql1 = `DELETE FROM Account
              WHERE account_id = ${accountId}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
    });
  });
};

const deleteGuestAccountById = (guestId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Guest
              WHERE guest_id = ${guestId}`;

  const sql1 = `DELETE FROM Guest
              WHERE guest_id = ${guestId}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
    });
  });
};

module.exports = {
  getAccountByEmail: getAccountByEmail,
  updateAccountInfoById: updateAccountInfoById,
  getAllGuestAccounts: getAllGuestAccounts,
  deleteAccountById: deleteAccountById,
  deleteGuestAccountById: deleteGuestAccountById,
};
