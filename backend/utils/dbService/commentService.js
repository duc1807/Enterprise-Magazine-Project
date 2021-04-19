const { getDataBaseConnection } = require("./connection/dbConnection");

/**
 * @description Get the article's comments
 * @params
 *      - articleId: Int (req.params)
 * @return
 *      - comments: Array[]
 * @notes
 */
const getCommentByArticleId = async (articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT Comment.*, Account.*
                FROM Comment
                INNER JOIN Account
                ON Account.account_id = Comment.FK_account_id
                WHERE FK_article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Add new comment to a specific article
 * @params
 *      - commentInfo: Object
 * 		  - userInfo: Object
 * @return null
 * @notes
 */
const addNewCommentToArticle = (commentInfo, userInfo) => {
  const { content, time, FK_article_id, FK_account_id } = commentInfo;
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

  // SQL for insert comment into database
  const sql1 = `INSERT INTO
                Comment (comment_content, comment_time, FK_article_id, FK_account_id)
				VALUES ('${content}', '${time}', '${FK_article_id}', '${FK_account_id}')`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      // Check if the article exist or the faculty permission is valid
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
  getCommentByArticleId: getCommentByArticleId,
  addNewCommentToArticle: addNewCommentToArticle,
};
