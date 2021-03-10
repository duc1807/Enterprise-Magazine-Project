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

const getSubmittedArticleById = (articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${DB_TABLE}
				  WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // if return with null result
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

const addNewCommentToArticle = (commentInfo, userInfo) => {
  const { content, time, FK_article_id, FK_coordinator_id } = commentInfo;
  let db = getDataBaseConnection();

  // Check if the current user has permission to add comment to the article or not
  const sql = `SELECT * , Event.event_id, Event.FK_faculty_id
				FROM Article
				LEFT JOIN Event
				ON Article.FK_event_id = Event.event_id
				LEFT JOIN Faculty
				ON Event.FK_faculty_id = Faculty.faculty_id
				LEFT JOIN Account
				ON Account.FK_faculty_id = Faculty.faculty_id
				WHERE Article.article_id = ${FK_article_id}
				AND Account.account_id = ${userInfo.account_id}`;

  // SQL for insert into database
  const sql1 = `INSERT INTO
                Comment (comment_content, comment_time, FK_article_id, FK_coordinator_id)
				VALUES ('${content}', '${time}', '${FK_article_id}', '${FK_coordinator_id}')`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      console.log("result check permission success: ", result);
      // Check if the article and is existed or not
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
  getPostedArticlesOfEvent: getPostedArticlesOfEvent,
  getSubmittedArticles: getSubmittedArticlesByEventId,
  getSubmittedArticleById: getSubmittedArticleById,
  addNewCommentToArticle: addNewCommentToArticle,
  createNewArticle: createNewArticle,
};
