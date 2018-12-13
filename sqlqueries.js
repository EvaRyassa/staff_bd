const mysql = require ("mysql");
const fs = require("fs");
const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '123456',
    database        : 'world'
});


exports.add_Staff = function (usersQuery) {

    pool.getConnection(function(err, connection) {
        if (err) throw err; // not connected!*/

        // Use the connection
        connection.query(usersQuery, function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;
            console.log(results);
            fs.writeFileSync("output.json", JSON.stringify(results, null, 2), "utf8");
            // Don't use the connection here, it has been returned to the pool.
        });
    });

};