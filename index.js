const express = require('express')

const app = express()
const server = require('http').Server(app);
const io = require("socket.io")(server);

const bodyParser=require('body-parser');
const tokenverification=require('./utile/authenticatetoken');
const routes=require('./utile/routes');
const registerChatHandlers = require("./utile/messages/chat");
const onConnection = (socket) => {
  
socket.on('join-room',roomId=>{
    socket.join(roomId, (err) => {
      if (err) {
          console.log(err);
          return;
      }
      io.to(roomId).emit('roomcreated', {msg: 'Room Created'});
      registerChatHandlers(io, socket,roomId);
   });
  })
}

app.use(bodyParser.urlencoded({
    extended:true                      
}));
app.use(bodyParser.json());

app.use('/auth',routes);
app.use('/s3url',routes)
io.use(tokenverification.verifySocketToken).on("connection", onConnection);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
