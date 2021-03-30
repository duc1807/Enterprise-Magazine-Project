const {
  getEventsByFacultyId,
  getEventById,
  createNewEvent,
  updateEvent,
  publishEventById,
  deleteEventById,
  getEventByArticleId,
  getPublishedEventOfFacultyId,
} = require("./eventService");
const {
  getAllFaculty,
  getFacultyById,
} = require("./facultyService");
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
  setArticleCommentOntime,
  setPendingArticle,
  setSelectedArticle,
  setRejectedArticle,
  getFileAndCommentByFileId,
  createPostedArticle,
  setNewArticleSubmissionFolderId,
  getArticleInformationById,
} = require("./articleService");
const {
  getCoordinatorAccountsByFaculty,
} = require("./coordinatorService");
const {
  getStudentAccountByFaculty,
} = require("./studentService");
const { getAccountByEmail } = require("./accountService");
const { getImageById } = require("./imageService");
const {
  getAdminAccountByUsername,
  createNewAccount,
  createNewGuestAccount,
  createAccountInformation,
  updateAccount,
  updateAccountStatus,
  updateGuestAccount,
  updateGuestAccountStatus,
  updateAccountInformation,
  getAllRolesInformation,
  getAccountsByRole,
} = require("./adminService");
const {
  getFileDetailById,
  uploadFile,
  deleteFileByFileId,
} = require("./fileService");
const {
  getCommentByArticleId,
} = require("./commentService");
const {
  getOverallStats,
  getContributionByFaculty,
  getAverageSelectedStats,
  getAverageCommentStats,
  getContributionEachMonthByYear,
} = require("./statisticService");
const { getGuestAccountByUsernameAndPassword } = require("./guestService");
const { updateFacultyFolderId } = require("./appService")

module.exports = {
  // ======================================================= Admin
  getAdminAccountByUsername: getAdminAccountByUsername,
  // Create new account
  createNewAccount: createNewAccount,
  // Create new account's information
  createAccountInformation: createAccountInformation,
  // Update an account information
  updateAccount: updateAccount,
  updateAccountInformation: updateAccountInformation,
  // Update account status
  updateAccountStatus: updateAccountStatus,
  // Get all roles from database
  getAllRolesInformation: getAllRolesInformation,
  // Get all accounts by role
  getAccountsByRole: getAccountsByRole,
  // Create new guest account
  createNewGuestAccount: createNewGuestAccount,
  // Update guest account
  updateGuestAccount: updateGuestAccount,
  // Update guest account status
  updateGuestAccountStatus: updateGuestAccountStatus,
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
  // Set article comment_onTime to TRUE
  setArticleCommentOntime: setArticleCommentOntime,
  // Get article information by article_id
  getArticleInformationById: getArticleInformationById,
  // ================================================================

  // ======================================================= File
  // Get file information
  getFileDetailById: getFileDetailById,
  uploadFile: uploadFile,
  deleteFileByFileId: deleteFileByFileId,
  // ================================================================

  // ======================================================= Student
  getStudentAccountByFaculty: getStudentAccountByFaculty,
  // ================================================================

  // ======================================================= Image
  getImageById: getImageById,
  // ================================================================

  // ======================================================= Comment
  getCommentByArticleId: getCommentByArticleId,
  // ================================================================

  // ======================================================= Statistic
  // Count total of Stats in general: All Event, All Contribution, ALL Selected, ALL Rejected
  getOverallStats: getOverallStats,
  // Count total of Contribution By Faculty And Article_STATUS
  getContributionByFaculty: getContributionByFaculty,
  // Count selected article on total contribution
  getAverageSelectedStats: getAverageSelectedStats,
  // Count the stats of article has comment on time
  getAverageCommentStats: getAverageCommentStats,
  // Count posted articles each months by year
  getContributionEachMonthByYear: getContributionEachMonthByYear,
  // ================================================================

  // =========================================================== GUEST
  getGuestAccountByUsernameAndPassword: getGuestAccountByUsernameAndPassword,
  // ================================================================
  
  // ============================================================ APP
  updateFacultyFolderId: updateFacultyFolderId
  // ================================================================
};
