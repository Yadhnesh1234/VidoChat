const express = require('express');
const bodyParser = require('body-parser');
const {Server} =  require('socket.io');

const io = new Server({
    cors:true
});
const app=express();

app.use(bodyParser.json());

const emailToSocketMap = new Map();
const socketToEmailMap = new Map()

io.on("connection",(socket)=>{
    console.log("New Connection")
    socket.on("join-room",(data)=>{
        console.log("user",data);
        const {roomId,username}=data;
        emailToSocketMap.set(username,socket.id)
        socketToEmailMap.set(socket.id,username)
        socket.join(roomId);
        socket.emit('joined-room',{roomId})

        socket.broadcast.to(roomId).emit("user-joined",{username})
    })

    socket.on('call-user',(data)=>{
         const {username,offer} = data
         const socketId = emailToSocketMap.get(username)
         const fromUser =socketToEmailMap.get(socket.id)
         socket.to(socketId).emit('incomming-call',{from:fromUser,offer})
    })

    socket.on('call-accepted',(data)=>{
         const {username,ans}=data
         const socketId = emailToSocketMap.get(username)
         const fromUser =socketToEmailMap.get(socket.id)
         socket.to(socketId).emit('accepted-call',{from:fromUser,ans})
    })
})

io.on('connection',(socket)=>{})

app.listen(8000,()=> console.log("Server Running on port 8000"));
io.listen(8001);