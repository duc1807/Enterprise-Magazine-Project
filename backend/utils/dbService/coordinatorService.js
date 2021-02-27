const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const _ROLE = "Account";
const _ROLE_ID = "2"

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getCoordinatorAccountByFaculty = async (facultyId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${_ROLE} WHERE faculty_id = '${facultyId}' AND role_id = '${_ROLE_ID}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

module.exports = {
  getCoordinatorAccountByFaculty: getCoordinatorAccountByFaculty,
};
