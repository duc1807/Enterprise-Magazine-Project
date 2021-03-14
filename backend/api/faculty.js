require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const webToken = require("jsonwebtoken");
const async = require("async");
const { google } = require("googleapis");

// Import database service
const {
	getEventsByFacultyName,
	getAllFaculty,
	getPostedArticlesOfEvent,
	getEventById,
	getSubmittedArticles,
	getSelectedArticles,
	getRejectedArticles,
} = require("../utils/dbService/index");

// Import middleware
const {
	managerValidation,
	gwAccountValidation,
	coordinatorValidation,
} = require("../api/middleware/verification");

// Constants
const _MANAGER_ROLE_ID = 3;

/**
 * @method GET
 * @permissions Manager
 * @description API for getting all Faculties information
 * @params null
 * @return
 *      - faculties: Array[]
 *          +
 * @notes
 */
router.get("/", managerValidation, async (req, res) => {
	// Get all faculties
	const query = getAllFaculty();
	let queryResult = undefined;

	await query
		.then((result) => {
			console.log("result: ", result);
			queryResult = result;
			res.status(200).json({
				status: res.statusCode,
				success: true,
				faculties: queryResult,
			});
		})
		.catch((err) => {
			console.log("Err: ", err);
			return res.status(501).json({
				status: res.statusCode,
				success: false,
				messages: "Bad request",
			});
		});
});

/**
 * @method GET
 * @permissions
 *      - Manager
 *      - Coordinators (exact faculty)
 *      - Students (exact faculty)
 * @description API for getting all events of a faculty
 * @params
 *      - facultyName: String (req.params)
 * @return
 *      - events: Array[]
 *          + .................................. ???
 * @notes
 */
router.get("/:facultyName", gwAccountValidation, async (req, res) => {
	const facultyName = req.params.facultyName;
	const data = res.locals.data;

	// If the user role is student || coordinator, check if their faculty is valid or not
	if (
		data.userInfo.FK_role_id != _MANAGER_ROLE_ID &&
		data.userInfo.faculty_name.toLowerCase() != facultyName.toLowerCase()
	) {
		return res.status(401).json({
			status: res.statusCode,
			success: false,
			messenger: "Faculty access permission required",
		});
	}

	// Get all events by faculty name from params
	const query = getEventsByFacultyName(facultyName);
	let queryResult = [];

	await query
		.then((result) => {
			console.log("result: ", result);
			queryResult = result;

			// Response event's infomations if success
			res.header("Content-Type", "application/json");
			res.status(200).json({
				status: res.statusCode,
				success: true,
				events: queryResult,
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
				// If err = false, return faculty not found
				return res.status(404).json({
					status: res.statusCode,
					success: false,
					messages: "Faculty not found",
				});
			}
		});
});

/**
 * @method GET
 * @permissions
 *      - Students (exact faculty)
 * @description API for getting event information for students
 * @params
 *      - facultyName: String (req.params)    ???
 *      - eventId: Int (req.params)
 * @return
 *      - events: Array[]
 *          + ..................................
 * @notes
 *      - Need facultyName      ????
 */
router.get("/:facultyName/:eventId", gwAccountValidation, async (req, res) => {
	const facultyName = req.params.facultyName;
	const eventId = req.params.eventId;

	const user = res.locals.data;

	// Check if the account has permission to access or not
	if (user.userInfo.faculty_name != facultyName) {
		return res.status(401).json({
			status: res.statusCode,
			success: false,
			message: "Permission required",
		});
	}

	// Get event info
	const query = getEventById(eventId);

	await query
		.then((result) => {
			console.log("result: ", result);

			res.status(200).json({
				status: res.statusCode,
				success: true,
				event: result[0], ///// Not sure if its work
			});
		})
		.catch((err) => {
			if (err) {
				console.log("Err: ", err);
				return res.status(501).json({
					status: res.statusCode,
					success: false,
					messages: "Bad request",
				});
			} else {
				// If er == false => Event not found
				return res.status(404).json({
					status: res.statusCode,
					success: false,
					messages: "Event not found",
				});
			}
		});
});

/**
 * @method GET
 * @permissions
 *      - Manager
 *      - Coordinators (exact faculty)
 *      - Students (exact faculty)
 *      - Guest ???
 * @description API for getting event information and its posted articles (news)
 * @params
 *      - facultyName: String (req.params)
 *      - eventId: Int (req.params)
 * @return
 *      - event: Array[]
 *          + .................................. ???
 *      - articles: Array[]
 *          + ........................... ???
 * @notes
 *      - Should check faculty valid before query -> Optimize
 */
router.get("/:facultyName/:eventId/postedArticles", async (req, res) => {
	const facultyName = req.params.facultyName;
	const eventId = req.params.eventId;

	// Get event info and its posted articles by eventId and facultyName
	const query = getPostedArticlesOfEvent(eventId, facultyName);

	await query
		.then((result) => {
			console.log("result: ", result);

			res.status(200).json({
				status: res.statusCode,
				success: true,
				// Because event is only 1, so dont need to pass array to Frontend
				event: result[result.length - 2][0],
				articles: result[result.length - 1],
			});
		})
		.catch((err) => {
			if (err) {
				console.log("Err: ", err);
				return res.status(501).json({
					status: res.statusCode,
					success: false,
					messages: "Bad request",
				});
			} else {
				// If er= = false => Event not found
				return res.status(404).json({
					status: res.statusCode,
					success: false,
					messages: "Event not found",
				});
			}
		});
});

/**
 * @method GET
 * @permissions
 *      - Coordinators (exact faculty)
 * @description API for getting new submissions of a faculty
 * @params
 *      - facultyName: String (req.params)
 *      - eventId: Int (req.params)
 * @return
 *      - status: Int
 *      - success: Boolean,
 *      - submittedArticles: Array[Object]
 *          {
 *            - article_id: Int,
 *            - article_submission_date: Int(Timestamp),
 *            - article_status: String,
 *            - article_folderId: String,
 *            - FK_account_id: Int,
 *            - FK_event_id: Int,
 *            - files: [
 *                {
 *                  file_id: Int,
 *                  file_mimeType: String,
 *                   file_fileId: String,
 *                  FK_article_id: Int
 *                }
 *             ]
 *          }
 * @notes
 */

router.get(
	"/:facultyName/:eventId/newsubmission",
	coordinatorValidation,
	async (req, res) => {
		const facultyName = req.params.facultyName;
		const eventId = req.params.eventId;

		// Get userInfo from middleware
		const data = res.locals.data;

		// Check if the faculty of the coordinator is valid or not
		if (data.userInfo.faculty_name != facultyName) {
			return res.status(401).json({
				status: res.statusCode,
				success: false,
				message: "Permission required to access to this faculty.",
			});
		}

		// Get event new submission
		const query = getSubmittedArticles(eventId);

		await query
			.then((result) => {
				console.log("query result: ", result);

				// Create array to store final data to return to frontend
				let articlesResult = [];

				// Create array for storing distinc iterated article_id
				let passedArticlesId = [];

				// Create Object for storing the article's position in 'articlesResult[]' for searching optimization
				let articlesPositionDetail = {};

				// Itarate each data in result
				result.map((articleInfo) => {
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

				// Finally, response the submittedArticles[]
				res.status(200).json({
					status: res.statusCode,
					success: true,
					submittedArticles: articlesResult,
				});
			})
			.catch((err) => {
				res.status(501).json({
					status: res.statusCode,
					success: false,
					messages: "Bad request",
				});
			});
	}
);

// ===================GET SELECTED ARTICLE===============================
router.get(
	"/:facultyName/:eventId/selectedarticles",
	coordinatorValidation,
	async (req, res) => {
		const facultyName = req.params.facultyName;
		const eventId = req.params.eventId;

		// Get middleware data
		const data = res.locals.data;

		// Check if the faculty of the coordinator is valid or not
		if (data.userInfo.faculty_name != facultyName) {
			return res.status(401).json({
				status: res.statusCode,
				success: false,
				message: "Permission required to access to this faculty.",
			});
		}

		// Get event new submission
		const query = getSelectedArticles(eventId);

		await query
			.then((result) => {
				console.log("result: ", result);

				// Create array to store final data to return to frontend
				let articlesResult = [];

				// Create array for storing distinc iterated article_id
				let passedArticlesId = [];

				// Create Object for storing the article's position in 'articlesResult[]' for searching optimization
				let articlesPositionDetail = {};

				// Itarate each data in result
				result.map((articleInfo) => {
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

				// Finally, response the selectedArticles[]
				res.status(200).json({
					status: res.statusCode,
					success: true,
					selectedArticles: articlesResult,
				});
			})
			.catch((err) => {
				res.status(501).json({
					status: res.statusCode,
					success: false,
					messages: "Bad request",
				});
			});
	}
);

// =================GET REJECTED ARTICLES===========================
router.get(
	"/:facultyName/:eventId/rejectedArticles",
	coordinatorValidation,
	async (req, res) => {
		const facultyName = req.params.facultyName;
		const eventId = req.params.eventId;
		const data = res.locals.data;
		console.log("data: ", data);
		if (data.userInfo.faculty_name != facultyName) {
			return res.statusCode(401).json({
				success: false,
				status: res.statusCode,
				message: "Permission required to access to this faculty.",
			});
		}
		// Get event new submission
		const query = getRejectedArticles(eventId);

		await query
			.then((result) => {
				console.log("result: ", result);

				// Create array to store final data to return to frontend
				let articlesResult = [];

				// Create array for storing distinc iterated article_id
				let passedArticlesId = [];

				// Create Object for storing the article's position in 'articlesResult[]' for searching optimization
				let articlesPositionDetail = {};

				// Itarate each data in result
				result.map((articleInfo) => {
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

				// Finally, response the rejectedArticles[]
				res.status(200).json({
					status: res.statusCode,
					success: true,
					rejectedArticles: articlesResult,
				});
			})
			.catch((err) => {
				res.status(501).json({
					status: res.statusCode,
					success: false,
					messages: "Bad request",
				});
			});
	}
);

// =================================================== TEST CODE

router.post("/:facultyName/:eventId/download", (req, res) => {
	const facultyName = req.params.facultyName;
	const eventId = req.params.eventId;

	res.json({
		test: "hihi",
	});
});

router.post("/", async (req, res) => {
	const { facultyId } = req.body;

	const query = getFacultyById("1");
	let queryResult = [];

	await query
		.then((result) => {
			console.log("result: ", result);
			queryResult = result;
		})
		.catch((err) => {
			console.log("Err: ", err);
			return res.status(501).json({
				messages: "Bad request",
			});
		});
});

module.exports = router;
