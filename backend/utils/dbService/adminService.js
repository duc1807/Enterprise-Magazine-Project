const connection = require('../config/dbconfig')

const getAdminAccountByUsername = async(username) => {
    const sql = `SELECT * FROM admin WHERE username = '${username}'`
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if(!!err) reject(err)
            resolve(result)
            // return result
        })
    })
}

module.exports = {
    getAdminAccountByUsername: getAdminAccountByUsername
}