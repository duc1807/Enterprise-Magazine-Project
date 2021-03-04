// const connection = require("../config/dbconfig");
const { query } = require("express");
const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const _TABLE = "Test";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getImageById = async (imageId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${_TABLE} WHERE id = '${imageId}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

module.exports = {
  getImageById: getImageById,
};
