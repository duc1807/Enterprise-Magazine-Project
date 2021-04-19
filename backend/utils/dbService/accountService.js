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
              LEFT JOIN Account_Info
              ON Account.account_id = Account_Info.FK_account_id 
              WHERE FK_role_id = ${roleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
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
  getAccountByEmail: getAccountByEmail,
  updateAccountInfoById: updateAccountInfoById,
  deleteAccountById: deleteAccountById,
  createNewAccount: createNewAccount,
  createAccountInformation: createAccountInformation,
  updateAccount: updateAccount,
  updateAccountStatus: updateAccountStatus,
  updateAccountInformation: updateAccountInformation,
  getAllRolesInformation: getAllRolesInformation,
  getAccountsByRole: getAccountsByRole,
};
