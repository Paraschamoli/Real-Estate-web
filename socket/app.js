import { Server } from "socket.io";

const io = new Server({
  cors: {
     origin: "https://boisterous-sunshine-e381f0.netlify.app",
    // origin: "http://localhost:5173",
  },
});

let onlineUser = [];

// Adds a user with their socket ID if they don't already exist
const addUser = (userId, socketId) => {
  const userExits = onlineUser.find((user) => user.userId === userId);
  if (!userExits) {
    onlineUser.push({ userId, socketId });
  }
};

// Removes the user based on their socket ID when they disconnect
const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

// Retrieves the user based on their user ID
const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

// Listen for connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // When a new user joins
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  // Handle sending a message to a specific user
  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    } else {
      console.log(`User with ID ${receiverId} is not connected.`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    removeUser(socket.id);
  });
});

// Server listening on the specified port
io.listen(process.env.PORT || 4000);
