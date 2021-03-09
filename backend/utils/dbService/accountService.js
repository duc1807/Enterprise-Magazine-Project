const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const _TABLE_ACCOUNT = "Account";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

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

module.exports = {
    getAccountByEmail: getAccountByEmail,
};