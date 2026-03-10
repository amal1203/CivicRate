import express from "express";
import cors from "cors";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import ratingRoute from "./routes/rating.route.js";
import officeRoute from "./routes/office.route.js";
import adminRoute from "./routes/admin.route.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/ratings", ratingRoute);
app.use("/api/offices", officeRoute);
app.use("/api/admin", adminRoute);

export default app;
