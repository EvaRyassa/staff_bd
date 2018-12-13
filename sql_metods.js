const mysql = require ("mysql");
const fs = require("fs");
const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '123456',
    database        : 'staffdb'
});


exports.staff_bd = function (usersQuery) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) throw err; // not connected!*/

            // Use the connection
            connection.query(usersQuery, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) {
                    throw error
                };
                resolve(results);
            });
        });

    })
};
