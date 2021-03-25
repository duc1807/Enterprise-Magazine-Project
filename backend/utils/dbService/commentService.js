const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

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
                WHERE FK_article_id = ${articleId}`

    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (!!err) reject(err);
        resolve(result);
        db.end();
      });
    });
  };

module.exports = {
    getCommentByArticleId: getCommentByArticleId
}