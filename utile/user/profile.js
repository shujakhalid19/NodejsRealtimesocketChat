const con=require('../db');
const {nanoid}=require('nanoid');

//return user details
const getProfileDetails=async (req,res)=>{

    console.log('NOW')
    const sql=`SELECT user_details_two.gender,role,relationship,sexuality,s_gender,s_sexuality,s_relation,s_role,about,desires,users.firstname,email,profileimg,plan FROM user_details_two INNER JOIN users ON user_details_two.uid=users.uid WHERE user_details_two.uid=$1`;
    var arr={state:false,err:false};
    try {
        var result=await con.query(sql,[req.id]);
        if(result.rowCount===1){
            arr.state=true;
            arr.err=false;
            arr.data=result.rows[0];
        }else{
            arr.err=true;
            arr.msg="No results found";
        }
    } catch (error) {
        console.log(error);
        arr.err=true;
        arr.msg='Bad Query';
    }
    res.send(arr);
    return;
}

//recommended match accounts are returned
const getRecommendation=async (req,res)=>{
    var arr={state:false,err:false};
    console.log(req.body);
    var det=req.body;
    var genders=det.s_gender.join(`','`);
    var stmt="'"+genders+"'";
    var sql=`SELECT users.uid,firstname,profileimg,user_details_two.gender,relationship,sexuality,role FROM users
    INNER JOIN user_details_two ON users.uid=user_details_two.uid
    WHERE user_details_two.gender IN (${stmt}) AND users.uid<>$1 LIMIT 10`

        
    // var sql=`SELECT users.uid,firstname,profileimg,user_details_two.gender FROM users
    // INNER JOIN user_details_two ON users.uid=user_details_two.uid
    //     WHERE user_details_two.gender IN (`;
    //     for (let i = 0; i < det.s_gender.length; i++) {
    //         if (i === 0) {
    //           sql += "'"+det.s_gender[i]+"'";
    //         } else {
    //           sql += ",'"+det.s_gender[i]+"'";
    //         }
    //       }
    //     sql+=`) AND users.uid<>$1`
    // var sql=`SELECT users.uid,firstname,profileimg,user_details_two.gender FROM users
    //              INNER JOIN user_details_two ON users.uid=user_details_two.uid
    //                   WHERE $1 && user_details_two.relationship 
    //                     OR $2 && user_details_two.sexuality
    //                     OR $3 && user_details_two.gender
    //                     OR users.uid!=$4`;

    // var sql=`SELECT users.uid,firstname,profileimg,user_details_two.gender FROM users
    //              INNER JOIN user_details_two ON users.uid=user_details_two.uid
    //                   WHERE user_details_two.relationship @> $1
    //                     AND user_details_two.sexuality @> $2
    //                     AND user_details_two.gender @> $3
    //                     AND users.uid!=$4`;
                            
                //         var sql=`SELECT users.uid,firstname,profileimg,user_details.gender FROM users
                //  INNER JOIN user_details ON users.uid=user_details.uid
                //       WHERE user_details.gender='Female'
                //         AND users.uid!=$1`;
                            
    //const field=[det.s_relation,det.s_sexuality,det.s_gender,req.id];
    //const field=[req.id];
    console.log(sql);
    const field=[req.id];
    console.log(field)
    
    try {
        var result=await con.query(sql,field);
        console.log(result);
        if(result.rowCount===0){
            arr.state=false;
            arr.msg='No Data Returned';
        }else{
            arr.state=true;
            arr.data=result.rows;
        }
    } catch (error) {
        console.log(error)
        arr.err=true;
    }
    res.send(arr);
    return;
}

const createInboxMessage=async (data,arr,time)=>{
    var sql="INSERT INTO inbox(chatid,senderid,recieverid,activitytime) VALUES($1,$2,$3,$4)";
    var key=nanoid(15).replace('_','x').replace('-','y');
    var field=[key,data[1],data[0],time];
    arr.ins=true;
    try {
        var result=await con.query(sql,field);
        if(result.rowCount===0){
            arr.ins=false;
            return arr;
        }
        arr.chatid=key;
        arr.ins=true;
    } catch (error) {
        arr.ins=false;
        arr.err=true
    }
    return arr;
}

const checkInbox=async (req,res)=>{
    var det=req.body;
    console.log(det);
    var arr={state:false,err:false};
    var sql="SELECT chatid FROM inbox WHERE senderid=$1 AND recieverid=$2 OR recieverid=$1 AND senderid=$2";
    var field=[det.newspark,req.id];
    try {
        var result=await con.query(sql,field);
        arr.state=true;
        console.log(result);
        if(result.rowCount===0){
            var ins=await createInboxMessage(field,arr,det.time)
            res.send(ins);
            return
        }
        arr.state=true;
        arr.msg='EXISTS'
    } catch (error) {
        arr.err=true
        console.log(error);
    }
    res.send(arr);
    return;
}

const getInbox=async (req,res)=>{
    var arr={state:false,err:false};
    var sql=`SELECT 
    inbox.chatid,messagestatus,lastsender,activitytime,
	reciever.firstname as recievername,reciever.uid as rid,reciever.profileimg as recieverimg,
	sender.firstname as sendername,sender.uid as sid,sender.profileimg as senderimg
    FROM inbox 
    INNER JOIN users as reciever
    ON reciever.uid =inbox.recieverid
    INNER JOIN users as sender
    ON sender.uid =inbox.senderid
    
    WHERE inbox.recieverid=$1 OR inbox.senderid=$1 ORDER BY inbox.activitytime DESC
    
    `;
    
    var field=[req.id];
    try {
        var result=await con.query(sql,field);
        arr.state=true;
        if(result.rowCount===0){
            arr.rowempty=true;
        }else{
            arr.rowempty=false;
            arr.data=result.rows
        }
    } catch (error) {
        arr.err=true;
    }
    res.send(arr);
    return;
}

    const getPreviousMessages=async (req,res)=>{
        
        var sql=`SELECT chats.message,messageType,deleted,chats.uid,createdAt,sender.firstname as sendername,reciever.firstname as recievername 
        FROM chats 
        INNER JOIN users as sender ON chats.senderid=sender.uid
        INNER JOIN users as reciever ON chats.recieverid=reciever.uid
        WHERE chats.chatid=$1 AND chats.createdat > $2 ORDER BY chats.createdat ASC`;
        var packet={state:false,err:false};
        try {
            var result= await con.query(sql,[req.body.chatid,req.body.yesterday]);
            packet.state=true;
            if(result.rowCount===0){
                packet.data=[];
            }else{
                packet.data=result.rows;
            }
        } catch (error) {
            packet.err=true;
        }
        res.send(packet)
    }

const updateProfileDetails=async (req,res)=>{
    var data=req.body;
    console.log(data,req.id);
    var field=[data.myoption,data.data,req.id];

    var sql;
    if(data.type===1){
        sql=`UPDATE user_details_two SET gender=$1 , s_gender=$2 WHERE uid=$3`;
    }else if(data.type===2){
        sql=`UPDATE user_details_two SET relationship=$1 , s_relation=$2 WHERE uid=$3`;
    }else if(data.type===3){
        sql="UPDATE user_details_two SET sexuality=$1 , s_sexuality=$2 WHERE uid=$3";
    }else{
        sql="UPDATE user_details_two SET role=$1 , s_role=$2 WHERE uid=$3";
    }
    try {
        var result = await con.query(sql,field);
        console.log(result);
    } catch (error) {
        console.log(error);
    }
    res.send({msg:'OK'})
}

const addProfileImage= async (req,res)=>{
    var det=req.body;
    var field=[req.id,det.newimage];
    var arr={state:false,err:false};
    var sql="INSERT into user_gallery(uid,image) VALUES ($1,$2)";
    try {
        var result=await con.query(sql,field);
        if(result.rowCount===0){
            arr.ins=false;
        }else{
            arr.state=true;
            arr.ins=true;
        }
    } catch (error) {
        arr.ins=false;
        arr.err=true
    }
    return res.send(arr);
}

const getProfileImage = async (req,res)=>{
    var arr={state:false,err:false};
    var field=[];
    if(req.body.friend===false) field=[req.id,false,0];
    else field=[req.body.friend,false,0];
    var sql="SELECT image FROM user_gallery WHERE uid::varchar=$1 AND block::boolean=$2 AND deleted=$3";
    try {
        var result=await con.query(sql,field);
        arr.state=true;
        if(result.rowCount===0){
            arr.empty=true;
        }else{
            arr.empty=false;
            arr.images=result.rows;
        }
        console.log(result)
    } catch (error) {
        console.log(error)
        arr.err=true
        arr.state=true    
    }
    return res.send(arr);
}

const removeProfileImage=async (req,res)=>{
    var arr={state:false,err:false};
    var field=[1,req.id,req.body.imageid];
    var sql="UPDATE user_gallery SET deleted=$1 WHERE uid=$2 AND image=$3";
    try {
        var result=await con.query(sql,field);
        arr.state=true
        if(result.rowCount===1){
            arr.updated=true;
        }else{
            arr.updated=false;
        }
    } catch (error) {
        arr.err=true;
    }
    return res.send(arr);
}

const updateDefaultImage=async (req,res)=>{
    var arr={state:false,err:false};
    var newimageurl='https://bucketeer-873994af-d5d2-4ecb-b8cc-1be3de8b052a.s3.eu-west-1.amazonaws.com/'+req.body.newimage;
    var field=[newimageurl,req.id];
    var sql="UPDATE users SET profileimg=$1 WHERE uid=$2";
    try {
        var result=await con.query(sql,field);
        arr.state=true
        if(result.rowCount===0){
            arr.update=false
        }else{
            arr.update=true;
        }
    } catch (error) {
        arr.err=true
    }
    return res.send(arr);
}

module.exports={
    addProfileImage,
    getProfileImage,
    removeProfileImage,
    getProfileDetails,
    getRecommendation,
    checkInbox,
    getInbox,
    updateProfileDetails,
    updateDefaultImage,
    getPreviousMessages
}