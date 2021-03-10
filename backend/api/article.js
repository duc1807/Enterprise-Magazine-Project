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
router.post("/:articleId/addcomment", gwAccountValidation, async (req, res) => {
	const { content } = req.body;
	const { articleId } = req.params;

	const data = res.locals.data;

	console.log("data: ", articleId);
	// Get the current time
	const currentTime = new Date();

	// INSERT into database
	const commentData = {
		content: content,
		time: currentTime.getTime(),
		FK_article_id: articleId,
		FK_coordinator_id: data.userInfo.account_id,
	};

	// Get get Posted Article by Id
	const query = getSubmittedArticleById(articleId);
	let submittedArticle;

	await query
		.then(async (result) => {
			console.log("result: ", result);
			submittedArticle = result;
			await addNewCommentToArticle(commentData, data.userInfo)
				.then((result) => {
					console.log("result: " + result);
					return res.status(201).json({
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
					message: "Artice not found!",
				});
			}
		});
});

module.exports = router;
