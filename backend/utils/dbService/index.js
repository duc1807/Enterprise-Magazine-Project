const { getEventsByFacultyName } = require('../../utils/dbService/eventService')
const { getAllFaculty } = require('../../utils/dbService/facultyService')
const { getSelectedArticlesOfEvent } = require('../../utils/dbService/articleService')

module.exports = {
    // Faculty
    getAllFaculty: getAllFaculty,

    // Event
    getEventsByFacultyName: getEventsByFacultyName,

    // Article
    getSelectedArticlesOfEvent: getSelectedArticlesOfEvent
}