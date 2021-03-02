// const connection = require("../config/dbconfig");
const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const TABLE = "Faculty";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getAllFaculty = async () => {
  let db = getDataBaseConnection();
  
  const sql = `SELECT * FROM ${TABLE}`;
  return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (!!err) reject(err);
        resolve(result);
        db.end();
        // return result
      });
  });
};

const getFacultyById = async (facultyID) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${TABLE} WHERE faculty_id = '${facultyID}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false)
      }
      resolve(result);

      // connection.destroy();
      // return result
    });
  });
};

// getEventsByFacultyName("IT").then(result => console.log(result))

module.exports = {
  getFacultyById: getFacultyById,
  getAllFaculty: getAllFaculty,
};
