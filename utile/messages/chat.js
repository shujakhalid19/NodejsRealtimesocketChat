module.exports = (io, socket,roomId) => {
    const con=require('../db');
    const {nanoid}=require('nanoid'); 
        const newMessage=async (data)=>{
            console.log(data);
            var msgtype=0;
            var key=nanoid(20).replace('_','x').replace('-','y');
            var mainmsg;
            if(data.media===true){
                msgtype=data.type;
                mainmsg=data.img;
            }else{
                mainmsg=data.text;
            }
            var sql="UPDATE inbox SET activitytime=$1 ,lastsender=$2, messagestatus=$3 WHERE chatid=$4";
            const update_fiels=[data.createdAt,socket.decoded.id,1,roomId];
            console.log("UP:",update_fiels);
            var result=con.query(sql,update_fiels);
            var field=[socket.decoded.id,data.friend,roomId,mainmsg,data.createdAt,msgtype,key];;
            sql="INSERT INTO chats(senderid,recieverid,chatid,message,createdAt,messageType,uid) VALUES($1,$2,$3,$4,$5,$6,$7)";
            try {
                result= await con.query(sql,field);
            } catch (error) {
                console.log(error)
            }    
        
            socket.broadcast.to(roomId).emit('newmsg',{
                message:mainmsg,
                uid:data.friend,
                key,
                time:data.createdAt,
                media:data.media,
                type:msgtype
            });
            
            //console.log(result);
        }

        const clearChat=async ()=>{
            var sql="UPDATE chats SET deleted=$1 WHERE chatid=$2";
            var field=[1,roomId];
            try {
                await con.query(sql,field);
                var sql="UPDATE inbox SET messagestatus=0 WHERE chatid=$1";
                field=[roomId];
                try {
                    await con.query(sql,field);
                } catch (error) {
                    console.log(error);    
                }
            } catch (error) {
                console.log(error);
            }
            io.to(roomId).emit('chatcleared',true);
        }

        const removeMessage=async (msgId)=>{
            var sql="UPDATE chats SET deleted=$1 WHERE uid=$2";
            var field=[1,msgId];
            try {
                await con.query(sql,field);
            } catch (error) {
                console.log(error);
            }
            io.to(roomId).emit('removemessage',{uid:msgId});
        }

        const typingindicator=(type)=>{
            socket.broadcast.to(roomId).emit('typingevent',type);
        }

        const updatemessageStatus=async ()=>{
            var sql="UPDATE inbox SET messagestatus=2 WHERE chatid=$1";
            const field=[roomId];
            try {
                await con.query(sql,field);
            } catch (error) {
                console.log(error);    
            }
            io.to(roomId).emit('isread',true);
        }

        const blockUser=async ()=>{
            var sql="UPDATE inbox SET block=$1 WHERE chatid=$2";
            var field=[true,roomId];
            try {
                await con.query(sql,field);
            } catch (error) {
                console.log(error);    
            }
            io.to(roomId).emit('isblocked',true);
        }

        const messageStatus=(id)=>{
            if(socket.decoded.id===id) return
            updatemessageStatus()
        }

        const screenshot_indicator=async (data)=>{
            io.to(roomId).emit('screenshottaken',true);
            var sql="UPDATE inbox SET activitytime=$1 ,lastsender=$2, messagestatus=$3 WHERE chatid=$4";
            var field=[data.createdAt,socket.decoded.id,1,roomId];
            var key=nanoid(20).replace('_','x').replace('-','y');
            try {
                con.query(sql,field);
                field=[socket.decoded.id,data.friend,roomId,data.text,data.createdAt,103,key];;
                sql="INSERT INTO chats(senderid,recieverid,chatid,message,createdAt,messageType,uid) VALUES($1,$2,$3,$4,$5,$6,$7)";
                try {
                    await con.query(sql,field);
                } catch (error) {
                    console.log(error)                    
                }

            } catch (error) {
                console.log(error)                    
            }
        }

        const setUserDisconnect=(id)=>{
            console.log('disconnected',socket.decoded);
        }
  
    socket.on('createmsg',newMessage)
    socket.on('deletemsg',removeMessage);
    socket.on('clearchat',clearChat);
    socket.on('screencaptured',screenshot_indicator)
    socket.on('typing',typingindicator)
    socket.on('setread',messageStatus);
    socket.on('disconnect',setUserDisconnect);
 
    socket.on('blockuser',blockUser);
}