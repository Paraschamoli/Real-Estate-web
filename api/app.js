import express from "express"
import authRoute from "./routes/auth.route.js"
const app=express();


// this is used to accept json file
app.use(express.json({ limit: "16kb" }));

//this is used to accept URL data.
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//this is used to store file/folder in server
app.use(express.static("public"));

//this is used perform CRUD operation in cookies
//access them.....
app.use(cookieParser());



app.use("/api/posts",authRoute)

export { app };