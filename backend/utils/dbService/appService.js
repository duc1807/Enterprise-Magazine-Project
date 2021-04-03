const { getDataBaseConnection } = require("./connection/dbConnection");

const updateFacultyFolderId = (facultiesInfo) => {
    // Get database connection
  let db = getDataBaseConnection();
  // Initialize query
  let sql = ``;
  // Map all item in facutiesInfo[], each item create sql to update in database
  facultiesInfo.map((facultyInfo) => {
    sql += `UPDATE Faculty
            SET faculty_folderId = '${facultyInfo.folderId}'
            WHERE faculty_name = '${facultyInfo.facultyName}';`;
  });

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  updateFacultyFolderId: updateFacultyFolderId,
};
