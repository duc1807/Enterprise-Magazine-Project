const { getDataBaseConnection } = require("./connection/dbConnection");

// Constants
const EVENT_PUBLISHED = 1;

// Query for get overall stats includes (Received article, Publish,..)
const getOverallStats = async () => {
  let db = getDataBaseConnection();

  const sql =
    // Count total article are submitted to the system
    `SELECT COUNT(article_id) AS TotalReceived FROM Article;` +
    // Count total of posted article on the system
    `SELECT COUNT(Article.article_id) AS TotalPublish FROM Article 
    INNER JOIN Event ON Article.FK_event_id = Event.event_id 
    WHERE Event.event_published = 1;`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if article is existed or not
      if (!result.length) {
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
  return new Promise((resolve, reject) => {
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
  });
};

// Query posted article each months by year
const getContributionEachMonthByYear = (year) => {
  let db = getDataBaseConnection();
  return new Promise((resolve, reject) => {
    // Main query
    let sql = ``;
    for (let i = 0; i < 12; i++) {
      let startDate = new Date(year, i, 1).getTime();
      let endDate = new Date(year, i + 1, 0).getTime();
      // Sub query to count posted article following each month
      const subSql = `SELECT COUNT(Article.article_id) AS PostedArticleInMonth${
        i + 1
      } FROM Article 
        INNER JOIN Event ON Article.FK_event_id = Event.event_id
        WHERE Event.event_published = ${EVENT_PUBLISHED} AND Article.article_submission_date BETWEEN ${startDate} AND ${endDate};`;
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
    // Count total pending contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS pendingContributions, Event.event_title AS eventTitle, Event.event_id AS eventId FROM Article 
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'pending'
    GROUP BY Event.event_title;` +
    // Count total selected contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS selectedContributions, Event.event_title AS eventTitle, Event.event_id AS eventId FROM Article 
    INNER JOIN Event ON Article.FK_event_id = Event.event_id
    WHERE Event.FK_faculty_id = ${facultyId} AND Article.article_status = 'accepted'
    GROUP BY Event.event_title;` +
    // Count total rejected contributions on each event by faculty -- Group by event_title
    `SELECT COUNT(Article.article_id) AS rejectedContributions, Event.event_title AS eventTitle, Event.event_id AS eventId FROM Article 
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
