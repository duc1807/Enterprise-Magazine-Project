const {
	getEventsByFacultyName,
	getEventById,
	createNewEvent,
	updateEvent,
	deleteEventById,
} = require('../../utils/dbService/eventService');
const { getAllFaculty, getFacultyById } = require('../../utils/dbService/facultyService');
const {
	getPostedArticlesOfEvent,
	createNewArticle,
	getSubmittedArticles,
	getSubmittedArticleById,
	addNewCommentToArticle,
} = require('../../utils/dbService/articleService');
const { getCoordinatorAccountsByFaculty } = require('../../utils/dbService/coordinatorService');
const { getStudentAccountByFaculty } = require('../../utils/dbService/studentService');
const { getAccountByEmail } = require('../../utils/dbService/accountService');
const { getImageById } = require('../../utils/dbService/imageService');
const { getAdminAccountByUsername } = require('../../utils/dbService/adminService');
const { uploadFile } = require('../../utils/dbService/fileService');

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
	getEventsByFacultyName: getEventsByFacultyName,
	// Create new event
	createNewEvent: createNewEvent,
	// Update an event
	updateEvent: updateEvent,
	// Delete an event
	deleteEventById: deleteEventById,
	// ================================================================



	// ======================================================= Article
	// Get all posted articles of event
	getPostedArticlesOfEvent: getPostedArticlesOfEvent,
	// Create new article
	createNewArticle: createNewArticle,
	// Get all submitted articles by eventId
	getSubmittedArticles: getSubmittedArticles,
	// Get a specific article by id
	getSubmittedArticleById: getSubmittedArticleById,
	// Add a comment to an article
	addNewCommentToArticle: addNewCommentToArticle,
	// ================================================================



	// ======================================================= File
	uploadFile: uploadFile,
	// ================================================================



	// ======================================================= Student
	getStudentAccountByFaculty: getStudentAccountByFaculty,
	// ================================================================



	// ======================================================= Image
	getImageById: getImageById,
	// ================================================================


};
