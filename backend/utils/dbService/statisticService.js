const { reject } = require("async");
const { promises } = require("fs");
const mysql = require("mysql2");
const { resolve } = require("path");
const { dbconfig } = require("../config/dbconfig");

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

const getTotalEvent = () => {
  let db = getDataBaseConnection();
  const sql = `SELECT COUNT(event_id) AS TotalOfEvents FROM Event`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        console.log("result is emty: ", result);
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

// const getTotalContribution = () => {
//   let db = getDataBaseConnection();
//   const sql = `SELECT COUNT(article_id) AS TotalOfContributions FROM Article`;

//   return new Promise((resolve, reject) => {
//     db.query(sql, (err, result) => {
//       if (!!err) reject(err);
//       if (!result.length) {
//         console.log("result: ", result);
//         reject(false);
//       }
//       resolve(result);
//       db.end();
//     });
//   });
// };

const getOverallStats = () => {
  let db = getDataBaseConnection();
  const sql =
    `SELECT COUNT(article_id) AS TotalOfContributions FROM Article;` +
    `SELECT COUNT(event_id) AS TotalOfEvents FROM Event;` +
    `SELECT COUNT(article_id) AS TotalOfAcceptedContributions FROM Article WHERE article_status = "accepted";` +
    `SELECT COUNT(article_id) AS TotalOfRejectedContributions FROM Article WHERE article_status = "rejected";`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      console.log("kqua tra ve: ", result);
      if (!result.length) {
        console.log("result: ", result);
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

const getContributionByFaculty = (facultyId) => {
  let db = getDataBaseConnection();
  const sql =
    `SELECT COUNT(Article.article_id) AS totalContributions
              FROM Article
              INNER JOIN Event ON Article.FK_event_id = Event.event_id
              WHERE Event.FK_faculty_id = ${facultyId};` +
    `SELECT COUNT(Article.article_id) AS totalPendingContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'pending';` +
    `SELECT COUNT(Article.article_id) AS totalSelectedContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'accepted';` +
    `SELECT COUNT(Article.article_id) AS totalRejectedContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'rejected';`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      if (!result.length) {
        console.log("kqua sql services: ", result);
        reject(false);
      }

      resolve(result);
      db.end();
    });
  });
};

const getContributionByStatus = (facultyId) => {
  let db = getDataBaseConnection();
  const sql =
    `SELECT COUNT(Article.article_id) AS TotalOfPendingContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'pending';` +
    `SELECT COUNT(Article.article_id) AS TotalOfSelectedContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'accepted';` +
    `SELECT COUNT(Article.article_id) AS TotalOfRejectedContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'rejected';`;

  return new Promise((reject, resolve) => {
    db.query(sql, (err, result) => {
      if (!!err) console.log(err);
      if (!result.length) {
        console.log("result: ", result);
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

module.exports = {
  getTotalEvent: getTotalEvent,
  getOverallStats: getOverallStats,
  getContributionByFaculty: getContributionByFaculty,
  getContributionByStatus: getContributionByStatus,
};
