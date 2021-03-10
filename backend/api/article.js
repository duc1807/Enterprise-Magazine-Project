require("dotenv").config();
const express = require("express");
const {
  getSubmittedArticleById,
  addNewCommentToArticle,
} = require("../utils/dbService/articleService");
const { gwAccountValidation } = require("./middleware/verification");
const router = express.Router();

const _COORDINATOR_PERISSION_ID = 2

/**
 * @method POST
 * @description API for adding new comment to the article
 * @api api/article/:articleId/addcomment
 * @params
 * 		- content: String (comment)
 * @return null
 * @notes
 *      - (!!! CORS problems)
 */
router
  .post("/:articleId/addcomment", gwAccountValidation, async (req, res) => {
	// Get comment content
    const { content } = req.body;
	// Get articleId from params
    const { articleId } = req.params;

	// Get userInfo passed from middleware
    const data = res.locals.data;

	// Check permission is coordinator or not
	if (data.userInfo.FK_role_id != _COORDINATOR_PERISSION_ID) {
		return res.status(401).json({
			status: res.statusCode,
			success: false,
			message: "Permission required!"
		})
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
  })

module.exports = router;
