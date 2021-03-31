const { getDataBaseConnection } = require('./connection/dbConnection')

const _TABLE_ACCOUNT = "Account_Info";

const getAccountInfoById = async (accountId) => {
  let db = getDataBaseConnection();

  // Get account information
  const sql = `SELECT *
               FROM ${_TABLE_ACCOUNT} 
               WHERE FK_account_id = ${accountId}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (!!err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
    getAccountInfoById: getAccountInfoById,
};