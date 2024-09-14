const { Server } = require("socket.io");

const io = new Server(5000, {
  cors: true,
});

const usernameToSocketIdMap = new Map();
const socketidToUsernameMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("room:join", (data) => {
    const { username, room } = data;
    usernameToSocketIdMap.set(username, socket.id);
    socketidToUsernameMap.set(socket.id, username);
    io.to(room).emit("user:joined", { username, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer, username: socketidToUsernameMap.get(socket.id) });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans, username: socketidToUsernameMap.get(socket.id) });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer, username: socketidToUsernameMap.get(socket.id) });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans, username: socketidToUsernameMap.get(socket.id) });
  });
});
