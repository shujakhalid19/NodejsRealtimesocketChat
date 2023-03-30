const con=require('../db');
const {nanoid}=require('nanoid');

const reportUser=(req,res)=>{
    console.log(req.body)
}

module.exports={
    reportUser
}