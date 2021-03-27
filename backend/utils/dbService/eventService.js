const { getDataBaseConnection } = require('./connection/dbConnection')

const TABLE = "Event";

const getEventsByFacultyId = async (facultyId) => {
  let db = getDataBaseConnection();

  const sql = ` SELECT * FROM Faculty
                WHERE faculty_id = '${facultyId}';  
                SELECT * FROM ${TABLE}
                WHERE FK_faculty_id = ${facultyId}`
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // If the faculty is not existed, return false
      if (!result[0].length) {
        reject(false);
      }
      // If faculty is valid, return the final query (get events by faculty)
      resolve(result[result.length - 1]);

      // connection.destroy();
      // return result
    });
  });
};

// ================================================= event_published currently is Number (1 and 2)
const getPublishedEventOfFacultyId = (facultyId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT *
              FROM ${TABLE}
              WHERE event_published = 1 AND FK_faculty_id = ${facultyId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      console.log("result: ", result);
      if (!!err) reject(err);
      resolve(result);
      db.end();
    });
  });
}


// const getEventById = (eventId) => {
//   let db = getDataBaseConnection();

//   const sql = `SELECT * FROM ${TABLE}
//                 WHERE event_id = ${eventId}`;

//   return new Promise((resolve, reject) => {
//     db.query(sql, (err, result) => {
//       if (!!err) reject(err);
//       if (!result.length) {
//         reject(false);
//       }
//       resolve(result);
//       db.end();
//     });
//   });
// };
// =============================================================== TEST NEW CODE
const getEventById = (eventId, facultyId) => {
  let db = getDataBaseConnection();

  console.log("faculty: ", facultyId);

  const sql = `SELECT *
              FROM ${TABLE}
              WHERE event_id = ${eventId} AND FK_faculty_id = ${facultyId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      console.log("result: ", result);
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};
// ===============================================================


const createNewEvent = async (eventInfo) => {
  const {
    title,
    content,
    imageData,
    startDate,
    endDate,
    createdAt,
    lastUpdate,
    folderId,
    selectedArticles,
    allArticles,
    FK_faculty_id,
  } = eventInfo;

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
          db.end();
        });
      }
      db.end();
    });
  });
};

const updateEvent = async (eventInfo) => {
  const {
    eventId,
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
                WHERE event_id = ${eventId} AND Faculty.faculty_id = '${FK_faculty_id}'`;

  const sql1 = `UPDATE Event 
                  SET
                  event_title = '${title}', 
                  event_content = '${content}', 
                  event_startDate = '${startDate}', 
                  event_endDate = '${endDate}', 
                  event_lastUpdate = '${lastUpdate}'
                  WHERE 
                  event_id = ${eventId}`;

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

const publishEventById = (eventId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${TABLE}
                WHERE event_id = ${eventId};`;
  const sql1 = `UPDATE ${TABLE}
                SET event_publish = "TRUE"
                WHERE event_id = ${eventId};`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if the Event is existed or not
      if (!result || !result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
      db.end();
    });
  });
};

const deleteEventById = (eventId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${TABLE}
                WHERE event_id = ${eventId};`;
  const sql1 = `DELETE FROM ${TABLE}
                WHERE event_id = ${eventId};`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      // Check if the Event is existed or not
      if (!result || !result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          // Return event information for notice
          resolve(result[0]);
        });
      }
      db.end();
    });
  });
};

const getEventByArticleId = (articleId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM ${TABLE}
                INNER JOIN Article
                ON Event.event_id = Article.FK_event_id
                WHERE Article.article_id = ${articleId};`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      console.log("db result: ", result);
      if (!!err) reject(err);
      resolve(result[0]);
      db.end();
    });
  });
};

module.exports = {
  getEventsByFacultyId: getEventsByFacultyId,
  getPublishedEventOfFacultyId: getPublishedEventOfFacultyId,
  getEventById: getEventById,
  createNewEvent: createNewEvent,
  updateEvent: updateEvent,
  publishEventById: publishEventById,
  deleteEventById: deleteEventById,
  getEventByArticleId: getEventByArticleId,
};
