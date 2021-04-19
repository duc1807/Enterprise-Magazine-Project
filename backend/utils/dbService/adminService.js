const { getDataBaseConnection } = require("./connection/dbConnection");

const _ROLE = "Admin";

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

module.exports = {
  getAdminAccountByUsername: getAdminAccountByUsername,
};
