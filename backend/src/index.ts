import express from "express";
import cookie from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js"
import sellerRoutes from "./routes/seller.js"

dotenv.config();

const app = express();

const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(cookie());
app.use("/admin", adminRoutes); 
app.use('', userRoutes)
app.use('/seller', sellerRoutes)

app.listen(port, () => {
  console.log(`Backend started at port ${port}`);
});
