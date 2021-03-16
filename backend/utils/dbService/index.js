const {
	getEventsByFacultyId,
	getEventById,
	createNewEvent,
	updateEvent,
	deleteEventById,
	getEventByArticleId,
} = require("../../utils/dbService/eventService");
const {
	getAllFaculty,
	getFacultyById,
} = require("../../utils/dbService/facultyService");
const {
	getPostedArticlesOfEvent,
	getArticleById,
	createNewArticle,
	getSubmittedArticles,
	getSelectedArticles,
	getRejectedArticles,
	getSubmittedArticleById,
	addNewCommentToArticle,
	setSelectedArticle,
	setRejectedArticle,
	getFileByFileId,
} = require("../../utils/dbService/articleService");
const {
	getCoordinatorAccountsByFaculty,
} = require("../../utils/dbService/coordinatorService");
const {
	getStudentAccountByFaculty,
} = require("../../utils/dbService/studentService");
const { getAccountByEmail } = require("../../utils/dbService/accountService");
const { getImageById } = require("../../utils/dbService/imageService");
const {
	getAdminAccountByUsername,
} = require("../../utils/dbService/adminService");
const { uploadFile } = require("../../utils/dbService/fileService");

module.exports = {
	// ======================================================= Admin
	getAdminAccountByUsername: getAdminAccountByUsername,
	// ================================================================

	// ======================================================= Coordinator
	getCoordinatorAccountsByFaculty: getCoordinatorAccountsByFaculty,
	// ================================================================

	// ======================================================= Account
	getAccountByEmail: getAccountByEmail,
	// ================================================================

	// ======================================================= Faculty
	getAllFaculty: getAllFaculty,
	getFacultyById: getFacultyById,
	// ================================================================

	// ======================================================= Event
	// Get event information
	getEventById: getEventById,
	// Get all events of a faculty
	getEventsByFacultyId: getEventsByFacultyId,
	// Create new event
	createNewEvent: createNewEvent,
	// Update an event
	updateEvent: updateEvent,
	// Delete an event
	deleteEventById: deleteEventById,
	// Get event information by articleId
	getEventByArticleId: getEventByArticleId,
	// ================================================================

	// ======================================================= Article
	// Get an article information
	getArticleById: getArticleById,
	// Get all posted articles of event
	getPostedArticlesOfEvent: getPostedArticlesOfEvent,
	// Create new article
	createNewArticle: createNewArticle,
	// Get all submitted articles by eventId
	getSubmittedArticles: getSubmittedArticles,
	//get all of selected articles by eventId
	getSelectedArticles: getSelectedArticles,
	//get all rejected articles by eventId
	getRejectedArticles: getRejectedArticles,
	// Get a specific article by id
	getSubmittedArticleById: getSubmittedArticleById,
	// Add a comment to an article
	addNewCommentToArticle: addNewCommentToArticle,
	// Set status of article to 'selected'
	setSelectedArticle: setSelectedArticle,
	// Set status of article to 'rejected'
	setRejectedArticle: setRejectedArticle,
	// ================================================================

	// ======================================================= File
	uploadFile: uploadFile,
	getFileByFileId: getFileByFileId,
	// ================================================================

	// ======================================================= Student
	getStudentAccountByFaculty: getStudentAccountByFaculty,
	// ================================================================

	// ======================================================= Image
	getImageById: getImageById,
	// ================================================================
};
