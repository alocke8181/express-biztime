/** Database setup for BizTime. */


const { Client } = require("pg");

let dbName;
if (process.env.NODE_ENV == 'test'){
  dbName = 'biztime_test';
}else{
  dbName = 'biztime';
};

let db = new Client({
    host: "/var/run/postgresql",
    database: dbName
  });
db.connect();


module.exports = db;