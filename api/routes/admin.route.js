import express from "express";
import {
  adminLogin,
  adminVisitCodesReport,
  listAdminVisitCodes,
} from "../controllers/admin.controller.js";
import { requireAdminAuth } from "../controllers/requireAdminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/visit-codes", requireAdminAuth, listAdminVisitCodes);
router.get("/visit-codes/report", requireAdminAuth, adminVisitCodesReport);

export default router;
