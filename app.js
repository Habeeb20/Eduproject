import express from "express"


import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import router from "./routes/userRoutes.js";
import { connectDb } from "./db.js";
import adminRouter from "./routes/adminRoutes.js";
import parentRouter from "./routes/parentRoutes.js";
import classRouter from "./routes/classRoute.js";
import attendanceRouter from "./routes/attendanceRoutes.js"
dotenv.config();

connectDb()
const app = express();



app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(morgan("dev"));

///routes
app.get("/", (req, res) => {
  res.send("growEasy backend is listening on port....");
});


app.use("/api/users", router)
app.use("/api/admin", adminRouter)
app.use("/api/parents", parentRouter)
app.use("/api/classes", classRouter)
app.use("/api/attendance", attendanceRouter)




// Start server
const port = process.env.PORT || 2020;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

})
