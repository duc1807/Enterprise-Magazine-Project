const { getEventsByFacultyName, getEventById, createNewEvent, updateEvent, deleteEventById } = require('../../utils/dbService/eventService')
const { getAllFaculty, getFacultyById } = require('../../utils/dbService/facultyService')
const { getPostedArticlesOfEvent } = require('../../utils/dbService/articleService')
const { getCoordinatorAccountsByFaculty } = require('../../utils/dbService/coordinatorService')
const { getStudentAccountByFaculty } = require('../../utils/dbService/studentService')
const { getAccountByEmail } = require('../../utils/dbService/accountService')
const { getImageById } = require('../../utils/dbService/imageService')

module.exports = {
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

    // Coordinator Manager
    getCoordinatorAccountsByFaculty: getCoordinatorAccountsByFaculty,

    // Student
    getStudentAccountByFaculty: getStudentAccountByFaculty,

    // Image
    getImageById: getImageById,
}