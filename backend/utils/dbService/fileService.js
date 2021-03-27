const { getDataBaseConnection } = require('./connection/dbConnection')
const { upload } = require("../multerStorage");

const DB_TABLE = "File";

// ======================================= OLD CODE

// const uploadFile = async (fileInfo) => {
//   // Get data from fileInfo
//   const { mimeType, fileId, FK_article_id } = fileInfo;

//   let db = getDataBaseConnection();

//   const sql = `INSERT INTO ${DB_TABLE} (file_mimeType, file_fileId, FK_article_id)
//                 VALUES ('${mimeType}', '${fileId}', '${FK_article_id}')`;

//   return new Promise((resolve, reject) => {
//     db.query(sql, (err, result) => {
//       if (!!err) reject(err);
//       resolve(result);
//       db.end();
//     });
//   });
// };

const getFileDetailById = async (fileId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM File
      WHERE file_id = ${fileId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        resolve(result);
      }
      db.end();
    });
  });
};

const uploadFile = async (filesInfo) => {
  let db = getDataBaseConnection();

  const sql =
    `INSERT INTO ${DB_TABLE} (file_mimeType, file_fileId, FK_article_id)
              VALUES ` +
    `${filesInfo.map(
      (file) => `('${file.mimeType}', '${file.fileId}', ${file.FK_article_id})`
    )}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

const deleteFileByFileId = (fileId, studentId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM File
              INNER JOIN Article
              ON Article.article_id = File.FK_article_id
              WHERE Article.FK_account_id = ${studentId}
              AND File.file_id = ${fileId}`;

  const sql1 = `DELETE FROM File
                WHERE file_id = ${fileId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
      db.end();
    });
  });
};

module.exports = {
  getFileDetailById: getFileDetailById,
  uploadFile: uploadFile,
  deleteFileByFileId: deleteFileByFileId,
};
