import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import googleroute from "./route/googleroute.js";
import cookieParser from "cookie-parser";
import dashboard from "./route/dashboard.js";
import session from "express-session";
import redisClient from "./config/redis.js";
import authRoute from "./route/authRoute.js";
import projectRoute from "./route/projectRoute.js";
import invuteRoute from "./route/inviteRoute.js";
import taskRoute from "./route/taskRoute.js";
import subTaskRoute from  "./route/subTaskRoute.js";


connectDB();
dotenv.config();
const app = express();
app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

redisClient.set('test', 'Hello Redis');
redisClient.get('test').then(value => console.log('Test value:', value));


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use("/api/auth",googleroute);
app.use('/api', dashboard)
app.use('/api/auth', authRoute)
app.use('/api',googleroute)
app.use('/api',projectRoute)
app.use('/api/invites', invuteRoute)
app.use('/api/tasks', taskRoute)
app.use('/api', subTaskRoute)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});