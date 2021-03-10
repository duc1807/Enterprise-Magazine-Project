const mysql = require("mysql2");

const dbconfig = {
  host: "45.252.250.39",
  user: "ucifbahh_gw",
  password: "tvXTdE[[uO$M",
  database: "ucifbahh_MagazineDB",
  port: 3306,
  multipleStatements: true,
  connectionLimit: 50,
  queueLimit: 20,
};

// dbconfig = {
//   host: "sql6.freemysqlhosting.net",
//   user: "sql6397094",
//   password: "QBAyQkR9HU",
//   database: "sql6397094",
//   port: 3306,
//   multipleStatements: true,
//   connectionLimit: 10,
//   queueLimit: 20,
//   // waitForConnections: false,
// }

const connection = mysql.createConnection(dbconfig);

connection.connect(function (err) {
  if (!!err) console.log(err);
  else console.log("Database connected");
});

const articleId = 1
const userInfo = {
  account_id: 14,
  email: "mailfortestapi@gmail.com",
  FK_faculty_id: "Business"
}

const sql = `SELECT * , Event.event_id, Event.FK_faculty_id
            FROM Article
            LEFT JOIN Event
            ON Article.FK_event_id = Event.event_id
            LEFT JOIN Faculty
            ON Event.FK_faculty_id = Faculty.faculty_id
            LEFT JOIN Account
            ON Account.FK_faculty_id = Faculty.faculty_id
            WHERE Article.article_id = ${articleId}
            AND Account.account_id = ${userInfo.account_id}`

connection.query(sql, (err, result) => {
  if(!!err) console.log(err);

  else {
    console.log(result)
  }
})
