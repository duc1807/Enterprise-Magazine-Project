const { getDataBaseConnection } = require("./connection/dbConnection");

const getGuestAccountByUsernameAndPassword = (username, password) => {
  let db = getDataBaseConnection();
  // Get guest account following username and password
  const sql = `SELECT * FROM Guest WHERE guest_name = '${username}' AND password = '${password}';`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      console.log("result: ", result);
      if (!result.length) {
        reject(false);
      }
      resolve(result);
      db.end();
    });
  });
};

const createNewGuestAccount = (guestAccountInfo) => {
  const { username, password, facultyId } = guestAccountInfo;

  let db = getDataBaseConnection();

  // INSERT guest account into database
  const sql = `INSERT INTO Guest(guest_name, password, FK_faculty_id)
              VALUES ('${username}', '${password}', ${facultyId})`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const updateGuestAccount = (guestAccountInfo, guestAccountId) => {
  const { username, password } = guestAccountInfo;

  let db = getDataBaseConnection();

  // UPDATE guest account in database
  const sql = `UPDATE Guest
              SET 
              guest_name = '${username}', 
              password = '${password}'
              WHERE guest_id = ${guestAccountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

const updateGuestAccountStatus = (currentStatus, guestAccountId) => {
  // If currentStatus = 1 => newStatus = 0 and opposite
  const newStatus = currentStatus ? 0 : 1;

  let db = getDataBaseConnection();

  // Check if account exist
  const sql = `SELECT * FROM Guest
              WHERE guest_id = ${guestAccountId}`;

  // UPDATE guest account in database
  const sql1 = `UPDATE Guest
              SET 
              enabled = ${newStatus}
              WHERE guest_id = ${guestAccountId}`;

  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false)
      } else {
        db.query(sql1, (err, result) => {
          if (!!err) reject(err);
          resolve(result);
        })
      }
      db.end()
    });
  });
};

const getAllGuestAccounts = async (username) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Guest`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
      // return result
    });
  });
};

const deleteGuestAccountById = (guestId) => {
  let db = getDataBaseConnection();

  const sql = `SELECT * FROM Guest
              WHERE guest_id = ${guestId}`;

  const sql1 = `DELETE FROM Guest
              WHERE guest_id = ${guestId}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      if (!result.length) {
        reject(false);
      } else {
        db.query(sql1, (err, result1) => {
          if (!!err) reject(err);
          resolve(result1);
        });
      }
    });
  });
};

module.exports = {
  getGuestAccountByUsernameAndPassword: getGuestAccountByUsernameAndPassword,
  createNewGuestAccount: createNewGuestAccount,
  updateGuestAccount: updateGuestAccount,
  updateGuestAccountStatus: updateGuestAccountStatus,
  getAllGuestAccounts: getAllGuestAccounts,
  deleteGuestAccountById: deleteGuestAccountById,
};
