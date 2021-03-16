require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");

const {
  addNewCommentToArticle,
  setSelectedArticle,
  getEventByArticleId,
  setRejectedArticle,
  getArticleById,
  getFileByFileId,
} = require("../utils/dbService/index");
const {
  insertFolderToOtherFolder,
  getAuthServiceJwt,
} = require("../utils/driveAPI");
const {
  gwAccountValidation,
  coordinatorValidation,
} = require("./middleware/verification");
const router = express.Router();

const _COORDINATOR_PERMISSION_ID = 2;

// Test code ================================================================
/**
 * @method GET
 * @API api/article/:articleId/
 * @permission
 *    - Manager coordinator of exact faculty
 * @description API for getting article information
 * @params
 * 		- articleId: Int
 * @return
 *    - article: Object
 * @notes
 *    - Not yet validate permission
 */
router.get("/:articleId", coordinatorValidation, async (req, res) => {
  // Get articleId from params
  const { articleId } = req.params;

  // Get userInfo passed from middleware
  const data = res.locals.data;

  const query = getArticleById(articleId);

  await query
    .then((result) => {
      // result[0] : article and its files
      // result[1] : article and its comments
      console.log("result: ", result);

      // Create array to store final data to return to frontend
      let articlesResult = [];

      // Create array for storing distinc iterated article_id
      let passedArticlesId = [];

      // Create Object for storing the article's position in 'articlesResult[]' for searching optimization
      let articlesPositionDetail = {};

      // Itarate each data in result[0]
      result[0].map((articleInfo) => {
        // Check if this article is exist in 'articlesResult' array or not
        if (passedArticlesId.includes(articleInfo.article_id)) {
          // If this article existed in 'articlesResult' array, push its file into 'article.files'

          // Get position of the article in 'articlesResult[]'
          let articlePosition =
            articlesPositionDetail[articleInfo.article_folderId];
          console.log("position: ", articlePosition);

          // Create file Object to store file information
          let file = {
            file_id: articleInfo.file_id,
            file_mimeType: articleInfo.file_mimeType,
            file_fileId: articleInfo.file_fileId,
            FK_article_id: articleInfo.FK_article_id,
          };

          // Insert file Object to its article in 'articlesResult[]'
          articlesResult[articlePosition].files.push(file);
        } else {
          // If this article not exist, push the article_id into 'passedArticlesId'
          passedArticlesId.push(articleInfo.article_id);

          // Create article Object to store information from result
          let article = {
            article_id: articleInfo.article_id,
            article_submission_date: articleInfo.article_submission_date,
            article_status: articleInfo.article_status,
            article_folderId: articleInfo.article_folderId,
            FK_account_id: articleInfo.FK_account_id,
            FK_event_id: articleInfo.FK_event_id,
            files: [],
            comments: [],
          };

          // Create file Object to store file information
          let file = {
            file_id: articleInfo.file_id,
            file_mimeType: articleInfo.file_mimeType,
            file_fileId: articleInfo.file_fileId,
            FK_article_id: articleInfo.FK_article_id,
          };

          // Push file Object into 'article.files' (only in first-time run)
          article.files.push(file);

          // Finally, push article information into 'articlesResult[]'
          articlesResult.push(article);

          // Storing article position in Object (key: articleFolderId, value: position in 'articlesResult[]')
          articlesPositionDetail[articleInfo.article_folderId] =
            articlesResult.length - 1;
        }
      });

      // Itarate each data in result[1]
      result[1].map((articleInfo) => {
        // Get position of the article in 'articlesResult[]'
        let articlePosition =
          articlesPositionDetail[articleInfo.article_folderId];
        console.log("position: ", articlePosition);

        // Create file Object to store file information
        let comment = {
          comment_id: articleInfo.comment_id,
          comment_time: articleInfo.comment_time,
          comment_content: articleInfo.comment_content,
          FK_article_id: articleInfo.FK_article_id,
          FK_coordinator_id: articleInfo.FK_coordinator_id,
        };

        // Insert file Object to its article in 'articlesResult[]'
        articlesResult[articlePosition].comments.push(comment);
      });

      // Finally, response the selectedArticles[]
      res.status(200).json({
        status: res.statusCode,
        success: true,
        article: articlesResult,
      });
    })
    .catch((err) => {
      if (err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        // If err == false => Event not found
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Event not found",
        });
      }
    });
});
// =========================================================================

/**
 * @method GET
 * @API /api/article/:articleId/file/:fileId/        ?????????????
 * @permission
 *    - Manager coordinator of exact faculty
 * @description API for getting article's .doc file information & comments
 * @params
 * 		- fileId: Int
 * @return
 *    - file: Object
 *    - comments: Array[Object]
 * @notes
 *    - Not yet validate permission
 */
router.get(
  "/:articleId/file/:fileId",
  coordinatorValidation,
  async (req, res) => {
    // Get articleId from params
    const { articleId, fileId } = req.params;

    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Get files and comments by fileId and articleId
    const query = getFileByFileId(fileId, articleId);

    await query
      .then(async (result) => {
        // Initialize drive service
        const jwToken = await getAuthServiceJwt();
        const drive = google.drive({
          version: "v3",
          auth: jwToken,
        });

        console.log("result: ", result);

        // Assignn result to variables
        const file = result[0][0]; // Because the file is only 1, so get the Object data at position 0
        const comments = result[1];

        // Finally, response the selectedArticles[]
        return res.status(200).json({
          status: res.statusCode,
          success: true,
          file: file,
          comments: comments,
        });
      })
      .catch((err) => {
        if (err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request",
          });
        } else {
          // If err == false => Event not found
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Not found",
          });
        }
      });
  }
);

/**
 * @method POST
 * @API api/article/:articleId/add-comment
 * @description API for adding new comment to the article
 * @params
 * 		- content: String (comment)
 * @return null
 * @notes
 *      - (!!! CORS problems)
 */
router.post(
  "/:articleId/add-comment",
  gwAccountValidation,
  async (req, res) => {
    // Get comment content
    const { content } = req.body;
    // Get articleId from params
    const { articleId } = req.params;

    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Check permission is coordinator or not
    if (data.userInfo.FK_role_id != _COORDINATOR_PERMISSION_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required!",
      });
    }

    // Log the data for testing
    console.log("data: ", data);

    // Get the current time
    const currentTime = new Date();

    // Create comment data to INSERT into database
    const commentData = {
      content: content,
      time: currentTime.getTime(),
      FK_article_id: articleId,
      FK_coordinator_id: data.userInfo.account_id,
    };

    // Await database query
    await addNewCommentToArticle(commentData, data.userInfo)
      .then((result) => {
        return res.status(201).json({
          status: res.statusCode,
          success: true,
          commentInfo: commentData,
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        } else {
          // If article doesnt exist or permission invalid
          return res.status(401).json({
            status: res.statusCode,
            success: false,
            message: "Invalid request!",
          });
        }
      });
  }
);

/**
 * @method PATCH
 * @API /api/article/:articleId/select-article
 * @description API for select an article
 * @params
 * 		- articleId: Int
 * @return null
 * @notes
 * 		- Should use method PUT ???
 * 		- Should pass articleId in req.params ??? Or body ???
 *    - Still not validate permission
 */
router.patch(
  "/:articleId/select-article",
  gwAccountValidation,
  async (req, res) => {
    // Get articleId from param
    const { articleId } = req.params;
    // Get userInfo passed from middleware
    const data = res.locals.data;

    // Check permission is coordinator or not
    if (data.userInfo.FK_role_id != _COORDINATOR_PERMISSION_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required!",
      });
    }

    // Set article status to selected in database
    const query = setSelectedArticle(articleId);

    await query
      .then(async (result) => {
        // If updated successfully, the get event information by articleId
        const query1 = getEventByArticleId(articleId);

        // After getting event information successfully, then alter folder in google drive
        await query1
          .then((articleAndEventInfo) => {
            console.log(articleAndEventInfo);

            // Asynchronous move article folder to selected article in Drive
            insertFolderToOtherFolder(articleAndEventInfo);

            // Return the success status
            return res.status(204).json({
              status: res.statusCode,
              success: true,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(501).json({
              status: res.statusCode,
              success: false,
              messages: "Bad request",
            });
          });
      })
      .catch((err) => {
        if (!!err) {
          console.log("Err: ", err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            messages: "Bad request",
          });
        } else {
          // If article || article status == 'pending' doesnt exist
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Invalid request!",
          });
        }
      });
  }
);

/**
 * @method PATCH
 * @API /api/article/:articleId/reject-article
 * @description API for reject an article
 * @param
 * 		- articleId: Int
 * @note
 * 		- Should pass articleId in req.params ??? Or body ???
 */
router.patch(
  "/:articleId/reject-article",
  gwAccountValidation,
  async (req, res) => {
    // Get articleId from req.params
    const { articleId } = req.params;

    console.log("ARTICLEID: ", articleId);

    // Get the userInfo passed from middleware
    const data = res.locals.data;

    console.log("DATA USERINFO: ", data);

    // Check if user has permisson to this api or not
    if (data.userInfo.FK_role_id != _COORDINATOR_PERMISSION_ID) {
      return res.status(401).json({
        status: res.statusCode,
        success: false,
        message: "Permission required!",
      });
    }

    // Set article status to rejected
    const query = setRejectedArticle(articleId);

    await query
      .then((result) => {
        return res.status(204).json({
          status: res.statusCode,
          success: true,
          message: `Article ${articleId} has been rejected`,
        });
      })
      .catch((err) => {
        if (!!err) {
          console.log(err);
          return res.status(501).json({
            status: res.statusCode,
            success: false,
            message: "Bad request!",
          });
        } else {
          // Check if article || article status == 'pending' doesnt exist
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Invalid request!",
          });
        }
      });
  }
);

/**
 * @method POST
 * @API /api/article/post-article
 * @description API for post article to event homepage
 * @params
 * 		- title: String
 * 		- content: String
 * 		- author: String (email)
 * @return null
 * @notes
 */
router.post("/post-article", gwAccountValidation, async (req, res) => {
  // Get information from param
  const { title, content, author } = req.params;

  // Get userInfo passed from middleware
  const data = res.locals.data;

  // Check permission is coordinator or not
  if (data.userInfo.FK_role_id != _COORDINATOR_PERMISSION_ID) {
    return res.status(401).json({
      status: res.statusCode,
      success: false,
      message: "Permission required!",
    });
  }

  // Get current time
  const currentTime = new Date();
  // Create article Object to INSERT INTO database
  const article = {
    title: title,
    content: content,
    author: author,
    postedDate: currentTime.getTime(),
  };

  // INSERT article into 'Posted_Article' table
  const query = postNewArticle(article);

  await query
    .then((result) => {
      return res.status(201).json({
        status: res.statusCode,
        success: true,
        message: "New article posted successfully",
      });
    })
    .catch((err) => {
      if (!!err) {
        console.log("Err: ", err);
        return res.status(501).json({
          status: res.statusCode,
          success: false,
          message: "Bad request",
        });
      } else {
        // If event not exist || permission to event is invalid
        return res.status(404).json({
          status: res.statusCode,
          success: false,
          message: "Invalid request!",
        });
      }
    });
});

module.exports = router;
