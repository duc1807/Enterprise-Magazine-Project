const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const DB_TABLE = "Article";

const ARTICLE_STATUS = {
  posted: "posted",
  accepted: "accepted",
  pending: "pending",
  rejected: "rejected",
};

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

// Get the posted artiles of event's newfeed
const getPostedArticlesOfEvent = async (eventId, facultyName) => {
  let db = getDataBaseConnection();

  console.log("test: ", eventId + " " + facultyName)

  const sql = //Check if faculty exist
             `SELECT * FROM Faculty
              WHERE faculty_name = '${facultyName}';`

              // Check if faculty exist event
            + `SELECT *, Faculty.faculty_name, Faculty.faculty_id
              FROM Event
              INNER JOIN Faculty ON Event.FK_faculty_id = Faculty.faculty_id
              WHERE event_id = ${eventId} AND Faculty.faculty_name = '${facultyName}';`

            //   // Check if event exist
            // + `SELECT * FROM Event
            //   WHERE event_id = ${eventId};`
              
              // Get articles (nullable)
            + `SELECT * FROM ${DB_TABLE} 
              WHERE FK_event_id = ${eventId}`;
              // AND ${DB_TABLE}._article_status = '${ARTICLE_STATUS.posted}'
              // `;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      /* Check if event/faculty is existed or not
       *  Bypass the final result because articles can be null
       */
      for (let i = 0; i < result.length - 1; i++) {
        if (!result[i].length) {
          reject(false);
        }
      }

      // Return result at the last position (Event info & Posted articles)
      resolve([result[result.length - 2], result[result.length - 1]]);
      db.end();
    });
  });
};

// getArticlesOfEvent("IT").then(result => console.log(result))

module.exports = {
  getPostedArticlesOfEvent: getPostedArticlesOfEvent,
};
