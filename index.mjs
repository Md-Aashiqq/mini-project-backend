import express from "express";
import cors from "cors";
import server from "http";
import { Server } from "socket.io";
import { v4 as uuidV4 } from "uuid";

const app = express();
const serve = server.Server(app);
const io = new Server(serve, {
  cors: {
    origin: "https://aiclass-mini-project.herokuapp.com",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
const port = process.env.PORT || 3000;

// Middlewares

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.use(express.urlencoded({ extended: true }));

app.get("/join", (req, res) => {
  console.log("sdsd");
  res.send({ link: uuidV4() });
});
app.get("/", (req, res) => {
  res.send("<h1>working</h1>" + port);
});

io.on("connection", (socket) => {
  console.log("socket established");
  socket.on("join-room", (userData) => {
    const { roomID, userID } = userData;
    socket.join(roomID);
    console.log(roomID);
    socket.to(roomID).emit("new-user-connect", userData);
    socket.on("disconnect", () => {
      socket.to(roomID).emit("user-disconnected", userID);
    });
    socket.on("broadcast-message", (message) => {
      socket
        .to(roomID)
        .emit("new-broadcast-messsage", { ...message, userData });
    });
    socket.on("display-media", (value) => {
      socket.to(roomID).emit("display-media", { userID, value });
    });
    socket.on("user-video-off", (value) => {
      socket.to(roomID).emit("user-video-off", value);
    });
  });
});

// Server listen initilized
serve
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on("error", (e) => {
    console.error(e);
  });
