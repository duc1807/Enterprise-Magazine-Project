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

  console.log("test: ", eventId + " " + facultyName);

  const sql = //Check if faculty exist
    `SELECT * FROM Faculty
              WHERE faculty_name = '${facultyName}';` +
    // Check if faculty exist event
    `SELECT *, Faculty.faculty_name, Faculty.faculty_id
              FROM Event
              INNER JOIN Faculty ON Event.FK_faculty_id = Faculty.faculty_id
              WHERE event_id = ${eventId} AND Faculty.faculty_name = '${facultyName}';` +
    //   // Check if event exist
    // + `SELECT * FROM Event
    //   WHERE event_id = ${eventId};`

    // Get articles (nullable)
    `SELECT * FROM ${DB_TABLE} 
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

const createNewArticle = (articleInfo) => {
  const {
    articleSubmissionDate,
    articleFolderId,
    FK_account_id,
    FK_event_id,
  } = articleInfo;

  let db = getDataBaseConnection();

  const sql = `INSERT INTO ${DB_TABLE}
              (article_submission_date, article_status, article_folderId, FK_account_id, FK_event_id)
              VALUES (${articleSubmissionDate}, '${ARTICLE_STATUS.pending}', '${articleFolderId}',
              ${FK_account_id}, ${FK_event_id})`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

const getSubmittedArticlesByEventId = (eventId) => {
  const db = getDataBaseConnection();

  // Select all articles of an event that status = pending, innerjoin with table "File"
  const sql = `SELECT *
              FROM ${DB_TABLE}
              INNER JOIN File ON ${DB_TABLE}.article_id = File.FK_article_id
              WHERE FK_event_id = ${eventId} 
              AND article_status = '${ARTICLE_STATUS.pending}'`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      else {
        console.log("kqua tim: ", result);
      }
      resolve(result);
      db.end();
    });
  });
};

// getArticlesOfEvent("IT").then(result => console.log(result))

module.exports = {
  getPostedArticlesOfEvent: getPostedArticlesOfEvent,
  createNewArticle: createNewArticle,
  getSubmittedArticles: getSubmittedArticlesByEventId,
};
