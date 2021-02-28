const { getEventsByFacultyName } = require('../../utils/dbService/eventService')
const { getAllFaculty } = require('../../utils/dbService/facultyService')
const { getPostedArticlesOfEvent } = require('../../utils/dbService/articleService')
const { getCoordinatorAccountByFaculty } = require('../../utils/dbService/coordinatorService')
const { getStudentAccountByFaculty } = require('../../utils/dbService/studentService')
const { getAccountByEmail } = require('../../utils/dbService/accountService')

module.exports = {
    // Account
    getAccountByEmail: getAccountByEmail,

    // Faculty
    getAllFaculty: getAllFaculty,

    // Event
    getEventsByFacultyName: getEventsByFacultyName,

    // Article
    getPostedArticlesOfEvent: getPostedArticlesOfEvent,

    // Coordinator Manager
    getCoordinatorAccountByFaculty: getCoordinatorAccountByFaculty,

    // Student
    getStudentAccountByFaculty: getStudentAccountByFaculty,
}