const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const usernameToSocketIdMap = new Map();
const socketidToUsernameMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  // When a user joins a room
  socket.on("room:join", (data) => {
    const { username, room } = data;

    // Map username to socket ID and vice versa
    usernameToSocketIdMap.set(username, socket.id);
    socketidToUsernameMap.set(socket.id, username);

    // Emit the username and socket ID to everyone in the room
    io.to(room).emit("user:joined", { username, id: socket.id });
    socket.join(room);

    // Optionally send back room info to the joining user
    io.to(socket.id).emit("room:join", data);
  });

  // Handle call events
  socket.on("user:call", ({ to, offer }) => {
    const fromUsername = socketidToUsernameMap.get(socket.id);
    io.to(to).emit("incomming:call", { from: socket.id, offer, username: fromUsername });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    const fromUsername = socketidToUsernameMap.get(socket.id);
    io.to(to).emit("call:accepted", { from: socket.id, ans, username: fromUsername });
  });

  // Handle negotiation events
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
