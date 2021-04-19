const { getDataBaseConnection } = require('./connection/dbConnection')

const _ROLE = "Account";
const _ROLE_ID = '1'

const getStudentAccountByFaculty = async (facultyId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${_ROLE} WHERE FK_faculty_id = '${facultyId}' AND FK_role_id = '${_ROLE_ID}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end()
    });
  });
};

module.exports = {
    getStudentAccountByFaculty: getStudentAccountByFaculty,
};
