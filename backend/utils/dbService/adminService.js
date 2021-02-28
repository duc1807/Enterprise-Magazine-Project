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

const getAdminAccountByUsernameAndPassword = (username, password) => {

  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${_ROLE} 
    WHERE username = '${username}' AND password = '${password}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
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
