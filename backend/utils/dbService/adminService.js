const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const _ROLE = "Admin";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getAllRolesInformation = () => {

  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Role`

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
              WHERE FK_role_id = ${roleId}`

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
  const { email, roleId, facultyId } = accountInfo

  let db = getDataBaseConnection();

  // INSERT account into database, with enabled = 1 (TRUE) 
  const sql = `INSERT INTO Account (email, FK_role_id, FK_faculty_id, enabled)
                VALUES ('${email}', ${roleId}, ${facultyId}, 1)`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};


const createAccountInformation = (accountDetail, accountId) => {
  const { firstName, surName } = accountDetail

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


const updateAccount = (accountDetail, accountId) => {
  const { email, roleId, facultyId } = accountDetail

  let db = getDataBaseConnection();

  const sql = `UPDATE Account
                SET 
                email = '${email}', 
                FK_role_id = ${roleId}, 
                FK_faculty_id = ${facultyId}
                WHERE account_id = ${accountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};


const updateAccountInformation = (accountDetail, accountId) => {
  const { firstName, surName } = accountDetail

  let db = getDataBaseConnection();

  const sql = `UPDATE Account_Info
                SET 
                first_name = '${firstName}', 
                sur_name = '${surName}'
                WHERE FK_account_id = ${accountId}`

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
  createAccountInformation: createAccountInformation,
  updateAccount: updateAccount,
  updateAccountInformation: updateAccountInformation,
  getAllRolesInformation: getAllRolesInformation,
  getAccountsByRole: getAccountsByRole,
};
