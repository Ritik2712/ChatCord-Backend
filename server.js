const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io"); // Add this
http = require("http");
require("dotenv").config();

const { addMessage, generateResponse } = require("./Utils/funcions");
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://chatcord-frontend-production.up.railway.app/",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/", require("./routes/User"));
app.use("/api/chat/", require("./routes/Chat"));

const io = new Server(server, {
  cors: {
    origin: "https://chatcord-frontend-production.up.railway.app/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("send", async (message, id) => {
    console.log(id);
    io.to(id).emit("message", message, socket.id, true);
    addMessage(message, id);
    const response = await generateResponse(message, id);
    io.to(id).emit("message", response, socket.id, false);
  });

  socket.on("join-room", (id) => {
    socket.join(id);
  });

  socket.on("disconnect", () => {
    console.log("user Disconnect");
  });
});

const dbo = require("./conn");
server.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});
