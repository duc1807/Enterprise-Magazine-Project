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

const redundantDbconfig = {
  host: "sql6.freemysqlhosting.net",
  user: "sql6397094",
  password: "QBAyQkR9HU",
  database: "sql6397094",
  port: 3306,
  multipleStatements: true,
  connectionLimit: 10,
  queueLimit: 20,
}

const connection = mysql.createConnection(dbconfig);

connection.connect(function (err) {
  if (!!err) console.log(err);
  else console.log("Database connected");
});

