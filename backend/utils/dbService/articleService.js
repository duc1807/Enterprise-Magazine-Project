const { getDataBaseConnection } = require("./connection/dbConnection");

const DB_TABLE = "Article";

const ARTICLE_STATUS = {
  posted: "posted",
  accepted: "accepted",
  pending: "pending",
  rejected: "rejected",
};

// Test code ================================================================

/**
 * @description Get the article information
 * @params
 *      - articleId: Int (req.params)
 * @return
 *      - article: Object
 *          + file: Array[]
 * @notes
 */
const getArticleByIdAndUserId = async (articleId, userId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${DB_TABLE}
              WHERE article_id = ${articleId}
              AND FK_account_id = ${userId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

const getArticleInformationById = async (articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${DB_TABLE}
              WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Get the article detail (files & comments)
 * @params
 *      - articleId: Int (req.params)
 * @return
 *      - article: Object
 *          + file: Array[]
 * @notes
 */
const getArticleDetailById = async (articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${DB_TABLE}
              INNER JOIN File
              ON File.FK_article_id = Article.article_id
              INNER JOIN Account 
              ON Account.account_id = Article.FK_account_id
              WHERE article_id = ${articleId};
              SELECT * FROM ${DB_TABLE}
              INNER JOIN Comment
              ON Comment.FK_article_id = Article.article_id
              WHERE article_id = ${articleId};`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Get the article's file information
 * @params
 *      - fileId: Int (req.params)
 * @return
 *      - article: Object
 *          + file: Array[]
 * @notes
 *      - Put service in fileService.js   ?????
 */
const getFileAndCommentByFileId = async (fileId, articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Article
              WHERE article_id = ${articleId};
              SELECT * FROM File
              WHERE file_id = ${fileId};
              SELECT * FROM Comment
              WHERE FK_article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if Article && File is valid
      if (!result[0].length || !result[1].length) {
        reject(false);
      }
      // Return the query[1] and query[2]
      resolve([result[1], result[2]]);
      db.end();
    });
  });
};

// =========================================================================

/**
 * @description Get the posted articles of event's newfeed
 * @params
 *      - eventId: Int (req.params)
 * 		  - facultyId: Int (req.params)
 * @return
 *      - postedArticles: Array[]
 *          + ........................... ???
 * @notes
 *      - Not yet add the WHERE condition for selecting posted articles
 */
// const getPostedArticlesOfEvent = async (eventId, facultyId) => {
//   let db = getDataBaseConnection();

//   console.log("test: ", eventId + " " + facultyId);

//   const sql = //Check if faculty exist
//     `SELECT * FROM Faculty
//               WHERE faculty_id = '${facultyId}';` +
//     // Check if faculty exist event
//     `SELECT * FROM Event
//               WHERE event_id = ${eventId} AND FK_faculty_id = '${facultyId}';` +
//     //   // Check if event exist
//     // + `SELECT * FROM Event
//     //   WHERE event_id = ${eventId};`

//     // Get articles (nullable)
//     `SELECT * FROM ${DB_TABLE}
//               WHERE FK_event_id = ${eventId}`;
//   // AND ${DB_TABLE}._article_status = '${ARTICLE_STATUS.posted}'
//   // `;

//   return new Promise((resolve, reject) => {
//     db.query(sql, (err, result) => {
//       if (!!err) reject(err);

//       /* Check if event/faculty is existed or not
//        *  Bypass the final result because articles can be null
//        */
//       for (let i = 0; i < result.length - 1; i++) {
//         if (!result[i].length) {
//           reject(false);
//         }
//       }

//       // Return result at the last position (Event info & Posted articles)
//       resolve([result[result.length - 2], result[result.length - 1]]);
//       db.end();
//     });
//   });
// };

// ============================================== DEVELOPMENT CODE (getPostedArticlesOfEvent)
// Student and Guest get only posted article of published event
const getPostedArticlesOfPublishedEvent = async (eventId) => {
  let db = getDataBaseConnection();

  const sql =
    // Get event information (and published)
    `SELECT * FROM Event
              WHERE event_id = ${eventId} AND event_published = 1;`;
  // Get articles (nullable) INNER JOIN PA_Image
  const sql1 = `SELECT * FROM Article 
                WHERE FK_event_id = ${eventId} 
                AND article_status = '${ARTICLE_STATUS.accepted}'`;
  // AND ${DB_TABLE}._article_status = '${ARTICLE_STATUS.posted}'
  // `;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      // Check if event is existed or not
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          // Return eventInfo and its posted articles
          const data = {
            eventInfo: result[0],
            postedArticles: result1
          }
          resolve(data);
        });
      }
      db.end();
    });
  });
};

// Manager and Coordinator get posted article of any event
const getPostedArticlesOfEvent = async (eventId) => {
  let db = getDataBaseConnection();

  const sql =
    // Get event information (and published)
              `SELECT * FROM Event
              WHERE event_id = ${eventId}`;
  // Get articles (nullable) INNER JOIN PA_Image
  const sql1 = `SELECT * FROM Article 
                WHERE FK_event_id = ${eventId} 
                AND article_status = '${ARTICLE_STATUS.accepted}'`;
  // AND ${DB_TABLE}._article_status = '${ARTICLE_STATUS.posted}'
  // `;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      // Check if event is existed or not
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          // Return eventInfo and its posted articles
          const data = {
            eventInfo: result[0],
            postedArticles: result1
          }
          resolve(data);
        });
      }
      db.end();
    });
  });
};
// ===============================================================

/**
 * @description Get all user articles
 * @params
 *      - userId: Int
 * @return
 *      - myArticles: Array[Object]
 * @notes
 */
const getSelfArticles = (userId) => {
  let db = getDataBaseConnection();
  console.log("self : ", userId);

  const sql = `SELECT ${DB_TABLE}.*, Event.event_title, Event.event_endDate
              FROM ${DB_TABLE}
              INNER JOIN Event
              ON Article.FK_event_id = Event.event_id
              WHERE Article.FK_account_id = ${userId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Create new article submission
 * @params
 *      - articleInfo: Object
 * @return null
 * @notes
 */
const createNewArticle = (articleInfo) => {
  const {
    articleSubmissionDate,
    articleFolderId,
    FK_account_id,
    FK_event_id,
    title,
    content,
    author
  } = articleInfo;

  let db = getDataBaseConnection();

  const sql = `INSERT INTO ${DB_TABLE}
              (article_submission_date, article_status, article_folderId, FK_account_id, FK_event_id,
                article_title, article_content, article_author)
              VALUES (${articleSubmissionDate}, '${ARTICLE_STATUS.pending}', '${articleFolderId}',
              ${FK_account_id}, ${FK_event_id}, '${title}', '${content}', '${author}')`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Get the article detail (files & comments)
 * @params
 *      - articleId: Int (req.params)
 * @return
 *      - article: Object
 *          + file: Array[]
 * @notes
 */
const setNewArticleSubmissionFolderId = async (folderId, articleId) => {
  let db = getDataBaseConnection();

  const sql = `UPDATE ${DB_TABLE}
              SET article_folderId = '${folderId}'
              WHERE article_id = ${articleId};`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Get the sumitted articles of event
 * @params
 *      - eventId: Int (req.params)
 *      - facultyId: Int (req.params)
 * @return
 *      - submittedArticles: Array[]
 *          + ........................... ???
 * @notes
 * 		- In case article has no file, return empty array ?? or still return article with empty file[] ???
 */
// const getSubmittedArticlesByEventId = (eventId, facultyId) => {
//   const db = getDataBaseConnection();

//   // Select all articles of an event that status = pending, innerjoin with table "File"
//   const sql = //Check if faculty exist
//     `SELECT * FROM Faculty
// 						WHERE faculty_id = '${facultyId}';` +
//     // Check if faculty exist event
//     `SELECT * FROM Event
// 						WHERE event_id = ${eventId} AND FK_faculty_id = '${facultyId}';` +
//     // Get the selected articles of event with its files
//     `SELECT *
//             FROM ${DB_TABLE}
//             INNER JOIN File ON ${DB_TABLE}.article_id = File.FK_article_id
//             WHERE FK_event_id = ${eventId} AND File.FK_article_id IS NOT NULL
//             AND article_status = '${ARTICLE_STATUS.pending}'`;

//   return new Promise((resolve, reject) => {
//     db.query(sql, (err, result) => {
//       if (!!err) reject(err);

//       /* Check if event/faculty is existed or not
//        *  Bypass the final result because articles can be null
//        */
//       for (let i = 0; i < result.length - 1; i++) {
//         if (!result[i].length) {
//           reject(false);
//         }
//       }

//       // Return the submitted article
//       resolve(result[result.length - 1]);
//       db.end();
//     });
//   });
// };

// ========================================================= DEVELOPMENT CODE (getSubmittedArticlesByEventId)
const getSubmittedArticlesByEventId = (eventId, facultyId) => {
  const db = getDataBaseConnection();

  // Check if faculty exist event
  const sql =
    `SELECT * FROM Event
						WHERE event_id = ${eventId} AND FK_faculty_id = '${facultyId}';` +
    // Select all articles of an event that status = pending, innerjoin with table "File"
    `SELECT *
            FROM ${DB_TABLE}
            INNER JOIN File 
            ON ${DB_TABLE}.article_id = File.FK_article_id
            INNER JOIN Account 
            ON Account.account_id = Article.FK_account_id
            LEFT JOIN Account_Info
            ON Account_Info.FK_account_id = Article.FK_account_id
            WHERE FK_event_id = ${eventId} AND File.FK_article_id IS NOT NULL
            AND article_status = '${ARTICLE_STATUS.pending}'`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);

      // Check if event is existed or not
      if (!result[0].length) {
        reject(false);
      }

      // Return the submitted article
      resolve(result[result.length - 1]);
      db.end();
    });
  });
};
// ============================================================================

// ========================================================= DEVELOPMENT CODE (getSelectedArticlesByEventId)

/**
 * @description Get the selected articles of event
 * @params
 *      - eventId: Int (req.params)
 *      - facultyId: Int (req.params)
 * @return
 *      - selectedArticles: Array[]
 *          + ........................... ???
 * @notes
 */
const getSelectedArticlesByEventId = (eventId, facultyId) => {
  const db = getDataBaseConnection();

  const sql =
    // Check if faculty exist event
    `SELECT * FROM Event
	  WHERE event_id = ${eventId} AND FK_faculty_id = ${facultyId};` +
    // Get the selected articles of event with its files
    `SELECT * FROM ${DB_TABLE}
    INNER JOIN File 
    ON ${DB_TABLE}.article_id = File.FK_article_id
    INNER JOIN Account 
    ON Account.account_id = Article.FK_account_id
    LEFT JOIN Account_Info
    ON Account_Info.FK_account_id = Article.FK_account_id
    WHERE ${DB_TABLE}.FK_event_id = ${eventId}
    AND ${DB_TABLE}.article_status = '${ARTICLE_STATUS.accepted}'`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if the articles is null or not
      if (!result[0].length) {
        reject(false);
      } else {
        resolve(result[result.length - 1]);
      }
      db.end();
    });
  });
};
// =============================================================================================

/**
 * @description Get the rejected articles of event
 * @params
 *      - eventId: Int (req.params)
 * 		  - facultyId: Int (req.params)
 * @return
 *      - rejectedArticles: Array[]
 *          + ........................... ???
 * @notes
 * 		- If article has no files, return empty rejectedArticle[]
 * 		- eventId and facultyId is not a number -> app crashed !!!!!!!!!!!!!!
 */
const getRejectedArticlesByEventId = (eventId, facultyId) => {
  const db = getDataBaseConnection();

  const sql =
    // Check if faculty exist event
    `SELECT * FROM Event
    WHERE event_id = ${eventId} AND FK_faculty_id = ${facultyId};` +
    // Get the selected articles of event with its files
    `SELECT * FROM ${DB_TABLE}
    INNER JOIN File 
    ON ${DB_TABLE}.article_id = File.FK_article_id
    INNER JOIN Account 
    ON Account.account_id = Article.FK_account_id
    LEFT JOIN Account_Info
    ON Account_Info.FK_account_id = Article.FK_account_id
    WHERE ${DB_TABLE}.FK_event_id = ${eventId} 
    AND ${DB_TABLE}.article_status = '${ARTICLE_STATUS.rejected}'`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if the articles is null or not
      if (!result[0].length) {
        reject(false);
      } else {
        resolve(result[result.length - 1]);
      }
      db.end();
    });
  });
};

/**
 * @description Get the exactly submitted article by Id
 * @params
 *      - articleId: Int
 * @return
 *      - article: Object
 * @notes
 */
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

const setArticleCommentOntime = (articleId, status) => {
  let db = getDataBaseConnection();

  // Set the comment_onTime status to 1 or 0 (status)
  const sql = `Update Article
              SET Article.comment_onTime = ${status ? 1 : 0}
				      WHERE Article.article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Create new posted article on event homepage
 * @params
 *      - articleInfo: Object
 *      - coordinatorId: Int
 * @return null
 * @notes
 */
const createPostedArticle = (articleInfo, coordinatorId) => {
  const { title, content, author, postedDate, eventId } = articleInfo;
  let db = getDataBaseConnection();

  // Check if the current user has permission to add comment to the article or not
  const sql = `SELECT * FROM Event
              INNER JOIN Account
              ON Event.FK_faculty_id = Account.FK_faculty_id
              WHERE Account.account_id = ${coordinatorId}
              AND Event.event_id = ${eventId}`;
  // Create new posted article
  const sql1 = `INSERT INTO Posted_Article(PA_title, PA_content, PA_author, PA_posted_date, FK_event_id)
                VALUES ('${title}', '${content}', '${author}', ${postedDate}, ${eventId})`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if the article exist or the faculty permission is valid
      if (!result.length) {
        reject(false);
      } else {
        // If valid, create posted article
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
      db.end();
    });
  });
};

/**
 * @description Set an article status to 'pending'
 * @params
 *      - articleId: Int
 * @return null
 * @notes
 */
const setPendingArticle = (articleId) => {
  let db = getDataBaseConnection();

  // Query for UPDATE article status to "accepted"
  const sql = `UPDATE ${DB_TABLE}
				SET Article.article_status = '${ARTICLE_STATUS.pending}'
				WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

/**
 * @description Set an article status to 'accepted'
 * @params
 *      - articleId: Int
 * @return null
 * @notes
 *      - Only can set status for 'pending' articles
 */
const setSelectedArticle = (articleId) => {
  let db = getDataBaseConnection();

  // Check if the article is existed or not and then update the status to accepted
  const sql = `SELECT * FROM ${DB_TABLE}
				WHERE article_id = ${articleId} AND article_status = '${ARTICLE_STATUS.pending}';`;

  // Query for UPDATE article status to "accepted"
  const sql1 = `UPDATE ${DB_TABLE}
				SET Article.article_status = '${ARTICLE_STATUS.accepted}'
				WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // if no article with status == 'pending' found, return false
      if (!result[0]) {
        reject(false);
      } else {
        // If article with status == 'pending' found, UPDATE to 'accepted'
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
      db.end();
    });
  });
};

/**
 * @description Set an article status to 'accepted'
 * @params
 *      - articleId: Int
 * @return null
 * @notes
 *      - Only can set status for 'pending' articles
 */
const setRejectedArticle = (articleId) => {
  let db = getDataBaseConnection();

  // Check if the article is existed or not and then update the status to accepted
  const sql = `SELECT * FROM ${DB_TABLE}
				WHERE article_id = ${articleId} AND article_status = '${ARTICLE_STATUS.pending}';`;

  // Query for UPDATE article
  const sql1 = `UPDATE ${DB_TABLE}
				SET Article.article_status = '${ARTICLE_STATUS.rejected}'
				WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // if no article with status == 'pending' found, return false
      if (!result[0]) {
        reject(false);
      } else {
        // If article with status == 'pending' found, UPDATE to 'rejected'
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
      db.end();
    });
  });
};

const createPostedArticleImages = async (imageIdArr, postedArticleId) => {
  let db = getDataBaseConnection();

  const sql =
    `INSERT INTO PA_Image (Image_image, FK_PA_id)
              VALUES ` +
    `${imageIdArr.map((imageId) => `('${imageId}', ${postedArticleId})`)}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
      db.end();
    });
  });
};

const getPostedArticleById = async (postedArticleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Posted_Article
              LEFT JOIN PA_Image
              ON PA_Image.FK_PA_id = Posted_Article.PA_id
              WHERE Posted_Article.PA_id = ${postedArticleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        resolve(result);
      }
      db.end();
    });
  });
};

const deleteArticleById = async (articleId, userId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Article
              WHERE article_id = ${articleId} 
              AND FK_account_id = ${userId} 
              AND article_status = '${ARTICLE_STATUS.pending}'`;
              
  const sql1 = `DELETE FROM Article
                WHERE article_id = ${articleId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result) => {
          if (err) reject(err);
          resolve(result)
        })
      }
      db.end();
    });
  });
};


module.exports = {
  getArticleById: getArticleByIdAndUserId,
  getArticleDetailById: getArticleDetailById,
  getSelfArticles: getSelfArticles,
  getPostedArticlesOfEvent: getPostedArticlesOfEvent,
  getPostedArticlesOfPublishedEvent: getPostedArticlesOfPublishedEvent,
  getSubmittedArticles: getSubmittedArticlesByEventId,
  getSelectedArticles: getSelectedArticlesByEventId,
  getRejectedArticles: getRejectedArticlesByEventId,
  getSubmittedArticleById: getSubmittedArticleById,
  getFileAndCommentByFileId: getFileAndCommentByFileId,
  setArticleCommentOntime: setArticleCommentOntime,
  createNewArticle: createNewArticle,
  createPostedArticle: createPostedArticle,
  setPendingArticle: setPendingArticle,
  setSelectedArticle: setSelectedArticle,
  setRejectedArticle: setRejectedArticle,
  setNewArticleSubmissionFolderId: setNewArticleSubmissionFolderId,
  getArticleInformationById: getArticleInformationById,
  createPostedArticleImages: createPostedArticleImages,
  getPostedArticleById: getPostedArticleById,
  deleteArticleById: deleteArticleById,
};
