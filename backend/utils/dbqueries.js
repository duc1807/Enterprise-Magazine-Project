const connection = require('./config/dbconfig')

const createQuery = async(sql) => {
    await connection.query(sql, (err, result) => {
        if(!!err) throw err
        console.log("Successful")
    })
}

const getQuery = async(sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if(!!err) reject(err)
            console.log("res in query file: ", result)
            resolve(result)
            // return result
        })
    })

    // return connection.query(sql, (err, result) => {
    //     if(!!err) return Promise.reject(err)
    //     console.log("res: ", result)
    //     // return result
    // })
}

const updateQuery = async(sql) => {
    await connection.query(sql, (err, result) => {
        if(!!err) throw err
        console.log("Successful")
    })
}

const deleteQuery = async(sql) => {
    await connection.query(sql, (err, result) => {
        if(!!err) throw err
        console.log("Successful")
    })
}

let ress = getQuery("SELECT * FROM admin")
ress.then(result => console.log("res: ", result)).catch(err => console.log(err))

module.exports = {
    createQuery: createQuery,
    getQuery: getQuery,
    updateQuery: updateQuery,
    deleteQuery:deleteQuery
}