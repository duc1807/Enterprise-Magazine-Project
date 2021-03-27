// const connection = require("../config/dbconfig");
const { getDataBaseConnection } = require('./connection/dbConnection')

const _TABLE = "Test";

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
