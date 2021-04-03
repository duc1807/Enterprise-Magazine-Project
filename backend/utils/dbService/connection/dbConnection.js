const mysql = require("mysql2");
const { dbconfig } = require("../../config/dbconfig");

/**
 * @description Function for returning connection to database
 * @return
 *      - connection (sql createConnection())
 * @notes
 */
const getDataBaseConnection = () => {
  const connection = mysql.createConnection(dbconfig);

  connection.connect(function (err) {
    if (!!err) console.log(err);
    else console.log("Database connected");
  });
  return connection;
};

module.exports = {
    getDataBaseConnection: getDataBaseConnection
}