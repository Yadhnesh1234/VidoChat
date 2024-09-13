const express = require('express');
const bodyParser = require('body-parser');
const {Server} =  require('socket.io');

const io = new Server({
    cors:true
});
const app=express();

app.use(bodyParser.json());

const emailToSocketMap = new Map();

io.on("connection",(socket)=>{
    console.log("New Connection")
    socket.on("join-room",(data)=>{
        console.log("user",data);
        const {roomId,username}=data;
        emailToSocketMap.set(username,socket.id)
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-joined",{username})
    })
})

io.on('connection',(socket)=>{})

app.listen(8000,()=> console.log("Server Running on port 8000"));
io.listen(8001);