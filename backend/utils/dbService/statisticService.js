const { getDataBaseConnection } = require('./connection/dbConnection')

// Query for get overall stats includes (Received article, Publish,..)
const getOverallStats = async () => {
  let db = getDataBaseConnection();

  const sql =
    // Count total article are submitted to the system
    `SELECT COUNT(article_id) AS TotalReceived FROM Article;` +
    // Count total of posted article on the system
    `SELECT COUNT(PA_id) AS TotalPublish FROM Posted_Article;`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if article is existed or not
      if (!result.length) {
        console.log("result: ", result);
        reject(false);
      }
      // Return articles if true
      resolve(result);
      db.end();
    });
  });
};

// Query stats for average selectedArticle on total received articles
const getAverageSelectedStats = () => {
  let db = getDataBaseConnection();
  const sql =
    // Count selected articles
    `SELECT COUNT(article_id) AS TotalAcceptedArticles FROM Article WHERE article_status = "accepted";` +
    // Count all received article
    `SELECT COUNT(article_id) AS TotalReceivedArticles FROM Article;`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if query result is existed or not
      if (!result.length) {
        reject(false);
      }
      //Return result
      resolve(result);
      db.end();
    });
  });
};

// Query average article has comment in 14 days
const getAverageCommentStats = () => {
  let db = getDataBaseConnection();
  // let commentOnTimes = [];
  // let submissionTimes = [];
  // const preSql = `SELECT article_submission_date FROM Article`;
  return new Promise((resolve, reject) => {
    // db.query(preSql, (err, timestamp) => {
    //   if (!!err) {
    //     return false;
    //   }
    //   if (!timestamp.length) {
    //     reject(false);
    //   } else {
    //     // console.log("my timestamp: ", timestamp);
    //     submissionTimes = timestamp;
    //     console.log("submissionTimes: ", submissionTimes);
    //     submissionTimes.map((result) => {
    //       //default milisecond ditance time per day
    //       const totalTimePerDay = 1000 * 3600 * 24;
    //       //comment time after 14 days
    //       let after = result.article_submission_date + 14 * totalTimePerDay;
    //       let commentObj = { commentTime: 0 };
    //       commentObj.commentTime = after;
    //       commentOnTimes.push(commentObj);
    //     });
    const sql =
      // Count all article
      `SELECT COUNT(*) AS AllArticle FROM Article;` +
      // Count article has comment on time
      `SELECT COUNT(*) AS CommentedArticle FROM Article WHERE Article.comment_onTime = 1;`;
    db.query(sql, (err, result1) => {
      if (!!err) reject(err);
      if (!result1.length) {
        console.log("result: ", result1);
        reject(false);
      }
      resolve(result1);
      db.end();
    });
    // }
    //   console.log("CommentOnTimes: ", commentOnTimes);
    //   db.end();
    // });
  });
};

// Query posted article each months by year
const getContributionEachMonthByYear = (year) => {
  let db = getDataBaseConnection();
  return new Promise((resolve, reject) => {
    // Main query
    let sql = ``;
    //---only development
    for (let i = 0; i < 12; i++) {
      let startDate = new Date(year, i, 1).getTime();
      let endDate = new Date(year, i + 1, 0).getTime();
      // console.log("startDate: ", startDate);
      // console.log("endDate: ", endDate);
      // Sub query to count posted article following each month
      const subSql = `SELECT COUNT(PA_id) AS PostedArticleInMonth${
        i + 1
      } FROM Posted_Article WHERE PA_posted_date BETWEEN ${startDate} AND ${endDate};`;
      // + string
      sql += subSql;
    }
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if result of counting is existed or not
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

// Query the category of contribution by each Faculty
const getContributionByFaculty = (facultyId) => {
  let db = getDataBaseConnection();
  const sql =
    //Count total of contributions on each event by faculty
    `SELECT COUNT(Article.article_id) AS totalContributions, Event.event_title AS Event_Title
    FROM Article
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId}
    GROUP BY Event.event_title;` +
    // Count total pending contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS totalPendingContributions, Event.event_title AS Event_Title
    FROM Article
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'pending'
    GROUP BY Event.event_title;` +
    // Count total selected contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS totalSelectedContributions, Event.event_title AS Event_Title
    FROM Article
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'accepted'
    GROUP BY Event.event_title;` +
    // Count total rejected contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS totalRejectedContributions, Event.event_title AS Event_Title
    FROM Article
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'rejected'
    GROUP BY Event.event_title;` +
    // Count total articles has commented on time by faculty => (get the productivity of coordinator of faculties)
    `SELECT COUNT(Article.article_id) AS totalCommentedOnTimeContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.comment_onTime= 1;` +
    //Count total articles which are not commented on time by faculty
    `SELECT COUNT(Article.article_id) AS totalUncommentedOnTimeContributions
            FROM Article
            INNER JOIN Event ON Article.FK_event_id = Event.event_id
            WHERE Event.FK_faculty_id = ${facultyId} AND Article.comment_onTime IS NULL;` +
    // Select details of article, event, faculty of article which is uncommented
    `SELECT Article.article_id, Event.event_title, Faculty.faculty_name FROM Article 
    INNER JOIN Event ON Article.FK_event_id = Event.event_id 
    INNER JOIN Faculty ON Event.FK_faculty_id = Faculty.faculty_id
    WHERE Article.comment_onTime IS NULL`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      //Check if result of query is null or not
      if (!result.length) {
        reject(false);
      }

      resolve(result);
      db.end();
    });
  });
};

module.exports = {
  getOverallStats: getOverallStats,
  getContributionByFaculty: getContributionByFaculty,
  getAverageSelectedStats: getAverageSelectedStats,
  getAverageCommentStats: getAverageCommentStats,
  getContributionEachMonthByYear: getContributionEachMonthByYear,
};
