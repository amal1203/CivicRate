import express from "express";
import { createRating } from "../controllers/rating.controller.js";
import { requireUserAuth } from "../controllers/requireUserAuth.js";

const router = express.Router();

router.post("/", requireUserAuth, createRating);

export default router;
