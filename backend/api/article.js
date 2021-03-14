require("dotenv").config();
const express = require("express");
const {
	addNewCommentToArticle,
	setSelectedArticle,
	getEventByArticleId,
	setRejectedArticle,
} = require("../utils/dbService/index");
const { insertFolderToOtherFolder } = require("../utils/driveAPI");
const { gwAccountValidation } = require("./middleware/verification");
const router = express.Router();

const _COORDINATOR_PERMISSION_ID = 2;

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
 * @method POST
 * @API api/article/:articleId/select-article
 * @description API for select article submission to the folder event's selected article
 * @params
 * 		- articleId: Int
 * @return null
 * @notes
 * 		- Should use method PUT ???
 * 		- Should pass articleId in req.params ??? Or body ???
 */
router.post(
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
 * @method POST
 * @API api/articles/reject-article
 * @description API for tranfer reject article to the folder event's rejected article
 * @param
 * -articleId: Int
 * @note
 */
router.post(
	"/:articleId/reject-article",
	gwAccountValidation,
	async (req, res) => {
		const { articleId } = req.params;
		console.log("ARTICLEID: ", articleId);
		const data = res.locals.data;
		console.log("DATA USERINFO: ", data);
		if (data.userInfo.FK_role_id != _COORDINATOR_PERMISSION_ID) {
			return res.status(401).json({
				status: res.statusCode,
				success: false,
				message: "Permission required!",
			});
		}

		const query = setRejectedArticle(articleId);
		await query
			.then(async (result) => {
				console.log("rejected article found by Id: ", result);
				const query1 = getEventByArticleId(articleId);
				await query.then((articleAndEventInfo) => {
					console.log("result: ", articleAndEventInfo);

					// Asynchronous move article folder to selected article in Drive
					insertFolderToOtherFolder(articleAndEventInfo);

					return res
						.status(204)
						.json({
							status: res.statusCode,
							success: true,
						})

						.catch((err) => {
							console.log(err);
							return res.status(501).json({
								status: res.statusCode,
								success: false,
								message: "Bad request!",
							});
						});
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
 * @API api/article/post-article
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
