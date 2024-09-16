import express from "express";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
//import testRoute from "./routes/test.route.js"
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
const app = express();

// this is used to accept json file
app.use(express.json());

//
app.use(cors({ "https://real-estate-web-ozog.onrender.com", credentials: true }));

//this is used perform CRUD operation in cookies
//access them.....
app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
//app.use("/api/test", testRoute);
export { app };

//this is used to accept URL data.
//app.use(express.urlencoded({ limit: "16kb" }));

//this is used to store file/folder in server
//app.use(express.static("public"));
