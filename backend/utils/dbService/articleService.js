// const connection = require("../config/dbconfig");
const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const DB_TABLE = "Article";

const articleStatus = {
    accepted: "accepted",
    pending: "pending",
    rejected: "rejected"
}

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getSelectedArticlesOfEvent = async (eventId) => {
  let db = getDataBaseConnection();
  
  const sql = `SELECT * FROM ${DB_TABLE} 
                WHERE event_id = '${eventId}'`
                // AND status = '${articleStatus.accepted}'
                // `;

  return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (!!err) reject(err);
        resolve(result);
        db.end();
        // return result
      });
  });
};

// getArticlesOfEvent("IT").then(result => console.log(result))

module.exports = {
  getSelectedArticlesOfEvent: getSelectedArticlesOfEvent,
};
