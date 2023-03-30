require('dotenv').config();
let pg = require('pg');
if (process.env.DATABASE_URL) {
  pg.defaults.ssl = true;
}
console.log(process.env.DATABASE_URL)
            // const {Pool}=require('pg');
            // module.exports=new Pool({
            //     host:"localhost",
            //     user:"shuja",
            //     password:"root",
            //     port:5432,
            //     database:"Altspark"
            // });
const {Pool}=require('pg');
module.exports =new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl: {rejectUnauthorized:false}
  });
