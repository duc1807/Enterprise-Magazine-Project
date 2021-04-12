const { getDataBaseConnection } = require("./connection/dbConnection");

const _ROLE = "Admin";
const _GUEST_ROLE_ID = 4;

const getAllRolesInformation = () => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Role`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const getAccountsByRole = (roleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Account
              WHERE FK_role_id = ${roleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const getAdminAccountByUsername = async (username) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${_ROLE} WHERE username = '${username}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const createNewAccount = (accountInfo) => {
  const { email, roleId, facultyId } = accountInfo;

  let db = getDataBaseConnection();

  // INSERT account into database, with enabled = 1 (TRUE)
  const sql = `INSERT INTO Account (email, FK_role_id, FK_faculty_id)
                VALUES ('${email}', ${roleId}, ${facultyId})`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const createNewGuestAccount = (guestAccountInfo) => {
  const { username, password, facultyId } = guestAccountInfo;

  let db = getDataBaseConnection();

  // INSERT guest account into database
  const sql = `INSERT INTO Guest(guest_name, password, FK_faculty_id)
              VALUES ('${username}', '${password}', ${facultyId})`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const createAccountInformation = (accountDetail, accountId) => {
  const { firstName, surName } = accountDetail;

  let db = getDataBaseConnection();

  const sql = `INSERT INTO Account_Info (first_name, sur_name, FK_account_id)
                VALUES ('${firstName}', '${surName}', ${accountId})`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const updateAccountStatus = (currentStatus, accountId) => {
  // If currentStatus = 1 => newStatus = 0 and opposite
  const newStatus = currentStatus ? 0 : 1;

  let db = getDataBaseConnection();

  // Check if account exist
  const sql = `SELECT * FROM Account
              WHERE account_id = ${accountId}`;

  // UPDATE account in database
  const sql1 = `UPDATE Account
              SET 
              enabled = ${newStatus}
              WHERE account_id = ${accountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false)
      } else {
        db.query(sql1, (err, result) => {
          if (!!err) reject(err);
          resolve(result);
        })
      }
      db.end()
    });
  });
};

// =============================================== Temporarily ignore
const updateAccount = (accountDetail, accountId) => {
  const { email, roleId, enabled, facultyId } = accountDetail;

  let db = getDataBaseConnection();

  const sql = `UPDATE Account
                SET 
                email = '${email}', 
                FK_role_id = ${roleId}, 
                FK_faculty_id = ${facultyId},
                enabled = ${enabled}
                WHERE account_id = ${accountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const updateGuestAccountStatus = (currentStatus, guestAccountId) => {
  // If currentStatus = 1 => newStatus = 0 and opposite
  const newStatus = currentStatus ? 0 : 1;

  let db = getDataBaseConnection();

  // Check if account exist
  const sql = `SELECT * FROM Guest
              WHERE guest_id = ${guestAccountId}`;

  // UPDATE guest account in database
  const sql1 = `UPDATE Guest
              SET 
              enabled = ${newStatus}
              WHERE guest_id = ${guestAccountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false)
      } else {
        db.query(sql1, (err, result) => {
          if (!!err) reject(err);
          resolve(result);
        })
      }
      db.end()
    });
  });
};

const updateGuestAccount = (guestAccountInfo, guestAccountId) => {
  const { username, password } = guestAccountInfo;

  let db = getDataBaseConnection();

  // UPDATE guest account in database
  const sql = `UPDATE Guest
              SET 
              guest_name = '${username}', 
              password = '${password}'
              WHERE guest_id = ${guestAccountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const updateAccountInformation = (accountDetail, accountId) => {
  const { firstName, surName } = accountDetail;

  let db = getDataBaseConnection();

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

module.exports = {
  getAdminAccountByUsername: getAdminAccountByUsername,
  createNewAccount: createNewAccount,
  createNewGuestAccount: createNewGuestAccount,
  createAccountInformation: createAccountInformation,
  updateAccount: updateAccount,
  updateAccountStatus: updateAccountStatus,
  updateGuestAccount: updateGuestAccount,
  updateGuestAccountStatus: updateGuestAccountStatus,
  updateAccountInformation: updateAccountInformation,
  getAllRolesInformation: getAllRolesInformation,
  getAccountsByRole: getAccountsByRole,
};
