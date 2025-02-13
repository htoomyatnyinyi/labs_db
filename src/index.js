import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import http from "http";
import dotenv from "dotenv";
import { Server as SocketIoServer } from "socket.io";

// Routes Import
import authRoute from "./routes/auth.js";
import messageRoute from "./routes/messages.js";
import userRoute from "./routes/user.js";
import jobRoute from "./routes/jobs.js";
import resumeRoute from "./routes/resume.js";
import dashboardRoute from "./routes/utils/dashboard.js";

// SERVER config
dotenv.config();
const PORT = process.env.PORT || 8081;

// SERVER INIT
const app = express();

// Socket IO init
const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("socketio is online and user are ready to connect");
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
  socket.on("disconnect", () => {
    console.log("socketios is offline and user are disconnected");
  });
});

app.use(express.json());
// Middleware to parse URL-encoded request bodies (for forms)
app.use(express.urlencoded({ extended: true })); // Important: extended: true for complex objects
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

app.use(
  session({
    secret: "htoomyatnyinyi", // a secret key to encrypt the cookies
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Routes
app.use("/", authRoute);
app.use("/", userRoute);
app.use("/", jobRoute);
app.use("/", resumeRoute);
app.use("/", dashboardRoute);

app.use("/", messageRoute(io));

server.listen(PORT, () => {
  console.log(`SERVER & SOCKET.IO IS RUNNING ON PORT: ${PORT}`);
});

export default app;
