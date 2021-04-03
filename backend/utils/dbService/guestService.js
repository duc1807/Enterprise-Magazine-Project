const { getDataBaseConnection } = require("./connection/dbConnection");

const getGuestAccountByUsernameAndPassword = (username, password) => {
  let db = getDataBaseConnection();
  // Get guest account following username and password
  const sql = `SELECT * FROM Guest WHERE guest_name = '${username}' AND password = '${password}';`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      console.log("result: ", result);
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

module.exports = {
  getGuestAccountByUsernameAndPassword: getGuestAccountByUsernameAndPassword,
};
