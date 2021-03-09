require('dotenv').config();
const express = require('express');
const { getSubmittedArticleById, addNewCommentToArticle } = require('../utils/dbService/articleService');
const { gwAccountValidation } = require('./middleware/verification');
const router = express.Router();

// Post comment
// api/article/:articleId/comment
router.post('/:articleId/comment', gwAccountValidation, async (req, res) => {
	const { content, articleId, coordinatorId } = req.body;

	// Get the current time
	const currentTime = new Date();

	// INSERT into database
	const commentData = {
		content: content,
		time: currentTime.getTime(),
		FK_article_id: articleId,
		FK_coordinator_id: coordinatorId,
	};

	// Get get Posted Article by Id
	const query = getPostedArticleById(articleId);
	let postedArticle;

	await query
		.then((result) => {
			console.log('result: ', result);
			postedArticle = result;
			addNewCommentToArticle(commentData)
				.then((result) => {
					console.log('result: ' + result);
					return res.status(201).json({
						commentInfo: commentData,
					});
				})
				.catch((err) => {
					if (!!err) {
						console.log(err);
						return res.status(500).json({
							success: false,
							message: 'Server error!',
						});
					}
				});
		})
		.catch((err) => {
			console.log('Err: ', err);
			return res.status(501).json({
				messages: 'Bad request',
			});
		});
});

module.exports = router;
