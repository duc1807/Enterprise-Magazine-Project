const connection = require("../config/dbconfig");

const _ROLE = "admin";

const getAdminAccountByUsername = async (username) => {
  const sql = `SELECT * FROM ${_ROLE} WHERE username = '${username}'`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const getAdminAccountByUsernameAndPassword = (username, password) => {
  const sql = `SELECT * FROM ${_ROLE} 
    WHERE username = '${username}', password = '${password}`;
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

module.exports = {
  getAdminAccountByUsername: getAdminAccountByUsername,
  authorizationAdmin: getAdminAccountByUsernameAndPassword
};
