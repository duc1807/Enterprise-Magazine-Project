const connection = require('./dbconfig')

// console.log("conn: ", connection)

const createQuery = async(sql) => {
    await connection.query(sql, (err, result) => {
        if(!!err) throw err
        console.log("Successful")
    })
}

const getQuery = async(sql) => {
    await connection.query(sql, (err, result) => {
        if(!!err) throw err
        console.log("res: ", result)
    })
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

// getQuery("SELECT * FROM test")

module.exports = {
    createQuery: createQuery,
    getQuery: getQuery,
    updateQuery: updateQuery,
    deleteQuery:deleteQuery
}