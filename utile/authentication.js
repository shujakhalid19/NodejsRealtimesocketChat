const jwt= require('jsonwebtoken');
require('dotenv').config();

const con=require('./db');
const {nanoid}=require('nanoid');

const insertUser=async (data,res)=>{
    //var user=data.user.providerData;
    var arr={state:false,err:true,ins:false};
    var sql='INSERT INTO users(uid,firstname,lastname,profileimg,email,data_joined) VALUES ($1,$2,$3,$4,$5,$6)';
    try {
        var key=nanoid(15).replace('_','x').replace('-','y');
        var result=await con.query(sql,[key,data.user.displayName,'',data.user.photoURL,data.user.email,data.time]);
        if(result.rowCount===1){
            const token=jwt.sign({id:key,email:data.user.email},process.env.JWT_SECRET);
            arr._token=token;
            arr.fullprofile=false;
            arr.state=true;
            arr.err=false;
            arr.ins=true;
        }
    } catch (error) {
        throw error;
    }
    console.log(arr);
    res.send(arr);
}

const storeUser=async (req,res)=>{
    
    var user=req.body;
    var arr={state:false,err:true};
    var sql="SELECT uid,fullprofile FROM users WHERE email=$1";
    try {
        var result=await con.query(sql,[user.user.email]);
        
        if(result.rowCount===0){
            insertUser(req.body,res);
            return;
        }else{
            
            const packet={id:result.rows[0]['uid'],email:user.user.email};
            console.log(packet);
            const token=jwt.sign(packet,process.env.JWT_SECRET);
            arr._token=token;
            arr.fullprofile=result.rows[0]
            arr.state=true;
            arr.err=false;
        }
    } catch (error) {
        console.log(error);
    }
    res.send(arr);
}
const main=(req,res)=>{
    console.log(req);
}


const storeUserDetails=(req,res)=>{
    console.log(req.body);
}

const storeUserDetailsTwo=async (req,res)=>{
    //check if user with id exists
    //if not add user details
    var det=req.body;
    console.log(det);
    var sql='SELECT id FROM user_details_two WHERE uid=$1';
    var arr={state:false,err:true};
    try {
        var result=await con.query(sql,[req.id]);
        if(result.rowCount===0){
            //details do not exist insert now
            var me=det.i_am;
            var lf=det.looking_for;
            var insert_val=[req.id,me.gender,me.meSmt,me.merel,me.merole,det.abt_me,det.me_des,lf.seek,lf.smt,lf.rel,lf.role,det.dob,det.age];
            sql=`INSERT INTO user_details_two(uid,gender,sexuality ,relationship ,role ,about ,desires ,s_gender ,s_sexuality ,s_relation ,s_role,dob,age) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
            try {
                result=await con.query(sql,insert_val);
                if(result.rowCount===1){
                    sql="UPDATE users SET fullprofile=true WHERE uid=$1";
                    try {
                        result=await con.query(sql,[req.id]);
                        arr.update=true;
                    } catch (error) {
                        arr.update=false;
                    }
                    arr.state=true;
                    arr.err=false;
                    arr.ins=true;
                }
            } catch (error) {
                arr.msg="Incorrect field values";
            }
        }else{
            arr.state=true;
            arr.err=false;
            arr.msg="Details already exist";
        }

    } catch (error) {
        arr.msg="Error while fetching details";
    }
    res.send(arr);
    return;
    
}

const storeFakeUser=async (req,res)=>{
    //console.log(req.body);
    var det=req.body;
    var fname=req.body.name.split(/(\s+)/)[0];
    var lname=req.body.name.split(/(\s+)/)[2];
    var arr={state:false,err:false};
    var sql='INSERT INTO users(uid,firstname,lastname,profileimg,email,data_joined) VALUES ($1,$2,$3,$4,$5,$6)';
    var key=nanoid(15).replace('_','x').replace('-','y');
    var field=[key,fname,lname,det.img,det.email,det.time];
    try {
        var result = await con.query(sql,field);
        if(result.rowCount===1){
            arr.state=true;
            arr.err=false,
            arr.msg='Fake acc created';
        }
    }catch(e){
        console.log(e);
        arr.err=true;
    }


res.send(arr);
    return;
}
module.exports={
    storeUser,
    main,
    storeUserDetails,
    storeUserDetailsTwo,
    storeFakeUser
}