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
	// Admin
	getAdminAccountByUsername: getAdminAccountByUsername,

	// Account
	getAccountByEmail: getAccountByEmail,

	// Faculty
	getAllFaculty: getAllFaculty,
	getFacultyById: getFacultyById,

	// Event
	getEventById: getEventById,
	getEventsByFacultyName: getEventsByFacultyName,
	createNewEvent: createNewEvent,
	updateEvent: updateEvent,
	deleteEventById: deleteEventById,

	// Article
	getPostedArticlesOfEvent: getPostedArticlesOfEvent,
	createNewArticle: createNewArticle,
	getSubmittedArticles: getSubmittedArticles,
	getSubmittedArticleById: getSubmittedArticleById,
	addNewCommentToArticle: addNewCommentToArticle,

	// File
	uploadFile: uploadFile,

	// Student
	getStudentAccountByFaculty: getStudentAccountByFaculty,

	// Image
	getImageById: getImageById,
};
