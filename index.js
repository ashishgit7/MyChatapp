const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

var obj = [];
const server = http.createServer(app);

const userData = new Map()

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
    socket.broadcast.emit("user_added", data)
    obj = [...obj, data]
    userData.set(data.userName,socket.id)
    console.log(`User with ID: ${socket.id} joined room: ${data.name}`);
  });
  socket.on('join_group',(data)=>{
      let grpName = data.grpName
      socket.join(grpName)
  })
  socket.on('send_group_message',(data)=>{
      console.log(data)
      io.in(data.grpName).emit('recieve_group_message',data)
  })
  socket.on("send_direct_message", (data) => {
    let receiverId = data.receiverId;
    let recieverSocketId = userData.get(receiverId)
    socket.emit("receive_direct_message",data)
    io.to(recieverSocketId).emit("receive_direct_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
var port = 3002
app.listen(port, function (err) {
    if(err){
        console.log("Error while starting server");
    }
    else{
        console.log("Server has been started at "+port);
    }
 })


 app.get('/data', function (req, res) {
    res.send({data:obj});
  })