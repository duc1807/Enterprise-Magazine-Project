// const connection = require("../config/dbconfig");
const mysql = require("mysql2");
const { dbconfig } = require("../config/dbconfig");

const TABLE = "Event";

const getDataBaseConnection = () => {
    const connection = mysql.createConnection(dbconfig);

    connection.connect(function(err) {
        if (!!err) console.log(err);
        else console.log("Database connected");
    });
    return connection;
};

const getEventsByFacultyName = async(facultyName) => {
    let db = getDataBaseConnection();

    const sql = `SELECT *, Faculty.faculty_name, Faculty.faculty_id
                  FROM ${TABLE}
                  JOIN Faculty ON Event.FK_faculty_id = Faculty.faculty_id
                  WHERE Faculty.faculty_name = '${facultyName}'`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (!!err) reject(err);
            resolve(result);
            db.end();
            // connection.destroy();
            // return result
        });
    });
};

const createNewEvent = async(eventInfo) => {
    const {
        title,
        content,
        // imageData,
        startDate,
        endDate,
        createdAt,
        lastUpdate,
        folderId,
        selectedArticles,
        allArticles,
        FK_faculty_id,
    } = eventInfo;

    let imageData = "test"
    
    let db = getDataBaseConnection();

    const sql = `SELECT * FROM Faculty
    WHERE faculty_id = ${FK_faculty_id};`;

    const sql1 = `INSERT INTO 
                  Event (event_title, event_content, event_image, event_startDate, event_endDate, event_createdAt,
                  event_lastUpdate, event_folderId, folderId_selectedArticles, folderId_allArticles, FK_faculty_id)
                  VALUES ('${title}', '${content}', '${imageData}', '${startDate}', '${endDate}', '${createdAt}', '${lastUpdate}', '${folderId}', '${selectedArticles}', '${allArticles}', '${FK_faculty_id}')`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (!!err) reject(err);
            // Check if the Faculty is existed or not
            if (!result.length) {
                reject(false);
            } else {
                db.query(sql1, (err, result) => {
                    if (!!err) reject(err);
                    resolve(result);
                    // db.end();
                    // connection.destroy();
                });
            }
            db.end();
        });
    });
};

const updateEvent = async(eventInfo) => {
    const {
        id,
        title,
        content,
        startDate,
        endDate,
        lastUpdate,
        folderId,
        FK_faculty_id,
    } = eventInfo;

    let db = getDataBaseConnection();

    const sql = `SELECT *, Faculty.faculty_name, Faculty.faculty_id
                FROM Event
                INNER JOIN Faculty ON Event.FK_faculty_id = Faculty.faculty_id
                WHERE event_id = ${id} AND Faculty.faculty_id = '${FK_faculty_id}'`;

    const sql1 = `UPDATE Event 
                  SET
                  event_title = '${title}', 
                  event_content = '${content}', 
                  event_startDate = '${startDate}', 
                  event_endDate = '${endDate}', 
                  event_lastUpdate = '${lastUpdate}'
                  WHERE 
                  event_id = ${id}`;

    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (!!err) reject(err);
            // Check if the Faculty is existed or not
            if (!result.length) {
                reject(false);
            } else {
                db.query(sql1, (err, result) => {
                    if (!!err) reject(err);
                    resolve(result);
                    // db.end();
                    // connection.destroy();
                });
            }
            db.end();
        });
    });
};

module.exports = {
    getEventsByFacultyName: getEventsByFacultyName,
    createNewEvent: createNewEvent,
    updateEvent: updateEvent
};