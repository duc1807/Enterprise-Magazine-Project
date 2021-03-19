const {
  getEventsByFacultyId,
  getEventById,
  createNewEvent,
  updateEvent,
  publishEventById,
  deleteEventById,
  getEventByArticleId,
  getPublishedEventOfFacultyId,
} = require("../../utils/dbService/eventService");
const {
  getAllFaculty,
  getFacultyById,
} = require("../../utils/dbService/facultyService");
const {
  getArticleById,
  getPostedArticlesOfEvent,
  getArticleDetailById,
  getSelfArticles,
  createNewArticle,
  getSubmittedArticles,
  getSelectedArticles,
  getRejectedArticles,
  getSubmittedArticleById,
  addNewCommentToArticle,
  setPendingArticle,
  setSelectedArticle,
  setRejectedArticle,
  getFileAndCommentByFileId,
  createPostedArticle,
  setNewArticleSubmissionFolderId,
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
const {
  uploadFile,
  deleteFileByFileId,
} = require("../../utils/dbService/fileService");
const {
  getOverallStats,
  getContributionByFaculty,
  getContributionByStatus,
} = require("./statisticService");

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
  // Get all published events of a faculty
  getPublishedEventOfFacultyId: getPublishedEventOfFacultyId,
  // Create new event
  createNewEvent: createNewEvent,
  // Update an event
  updateEvent: updateEvent,
  // Publish an event
  publishEventById: publishEventById,
  // Delete an event
  deleteEventById: deleteEventById,
  // Get event information by articleId
  getEventByArticleId: getEventByArticleId,
  // ================================================================

  // ======================================================= Article
  // Get an article information
  getArticleById: getArticleById,
  // Get article's specific files and comment
  getFileAndCommentByFileId: getFileAndCommentByFileId,
  // Get an article detail (with files and comments)
  getArticleDetailById: getArticleDetailById,
  // Get current student articles
  getSelfArticles: getSelfArticles,
  // Get all posted articles of event
  getPostedArticlesOfEvent: getPostedArticlesOfEvent,
  // Create new article
  createNewArticle: createNewArticle,
  // Create new posted article
  createPostedArticle: createPostedArticle,
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
  // Set status of article to 'pending'
  setPendingArticle: setPendingArticle,
  // Set status of article to 'selected'
  setSelectedArticle: setSelectedArticle,
  // Set status of article to 'rejected'
  setRejectedArticle: setRejectedArticle,
  // Set new article submission folderId
  setNewArticleSubmissionFolderId: setNewArticleSubmissionFolderId,
  // ================================================================

  // ======================================================= File
  uploadFile: uploadFile,
  deleteFileByFileId: deleteFileByFileId,
  // ================================================================

  // ======================================================= Student
  getStudentAccountByFaculty: getStudentAccountByFaculty,
  // ================================================================

  // ======================================================= Image
  getImageById: getImageById,
  // ================================================================

  // ======================================================= Statistic
  // Count total of Stats in general: All Event, All Contribution, ALL Selected, ALL Rejected
  getOverallStats: getOverallStats,
  // Count total of Contribution By Faculty And Article_STATUS
  getContributionByFaculty: getContributionByFaculty,
  getContributionByStatus: getContributionByStatus,
};
