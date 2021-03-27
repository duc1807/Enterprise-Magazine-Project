const { getDataBaseConnection } = require('./connection/dbConnection')

const TABLE = "Faculty";

const getAllFaculty = async () => {
  let db = getDataBaseConnection();
  
  // SELECT all faculty where folderId is NOT NULL (role 99)
  const sql = `SELECT * FROM ${TABLE}
              WHERE faculty_folderId IS NOT NULL`;
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
