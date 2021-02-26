// const connection = require("../config/dbconfig");
const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const TABLE = "Event";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getEventsByFacultyName = async (facultyName) => {
    let db = getDataBaseConnection();
  
    const sql = `SELECT *, Faculty.name, Faculty.id
                  FROM ${TABLE}
                  JOIN Faculty ON Event.faculty_id = Faculty.id
                  WHERE Faculty.name = '${facultyName}'`;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (!!err) reject(err);
        resolve(result);
        db.end();
        // connection.destroy();
        // return result
      });
    });
  }

  module.exports = {
    getEventsByFacultyName: getEventsByFacultyName
  };