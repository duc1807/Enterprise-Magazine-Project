require("dotenv").config();
const express = require("express");
const {
  getSubmittedArticleById,
  addNewCommentToArticle,
} = require("../utils/dbService/articleService");
const { gwAccountValidation } = require("./middleware/verification");
const router = express.Router();

// Post comment
// api/article/:articleId/addcomment
router
  .post("/:articleId/addcomment", gwAccountValidation, async (req, res) => {
	// Get comment content
    const { content } = req.body;
	// Get articleId from params
    const { articleId } = req.params;

    const data = res.locals.data;

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
          return res.status(404).json({
            status: res.statusCode,
            success: false,
            message: "Permission to faculty event required!",
          });
        }
      });
  })

module.exports = router;
