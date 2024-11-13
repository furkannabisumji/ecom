import express from "express";
import { verifyUser } from "../middlewares/verifyuser.js";

const router = express.Router();

router.post("/slot", verifyUser, async (req, res) => {
  try {


  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;