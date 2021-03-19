const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");
const { upload } = require("../multerStorage");

const DB_TABLE = "File";

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

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

const uploadFile = async (filesInfo) => {
  let db = getDataBaseConnection();

  const sql = `INSERT INTO ${DB_TABLE} (file_mimeType, file_fileId, FK_article_id)
              VALUES ` + 
              `${filesInfo.map(file => 
                `('${file.mimeType}', '${file.fileId}', ${file.FK_article_id})`)}`

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};


module.exports = {
  uploadFile: uploadFile,
};
