import express from "express";
import {
  issueOfficeVisitCodes,
  listEmployeesByOffice,
  listOffices,
  verifyOfficeVisitCode,
} from "../controllers/office.controller.js";
import { requireAdminAuth } from "../controllers/requireAdminAuth.js";

const router = express.Router();

router.get("/", listOffices);
router.get("/:officeId/employees", listEmployeesByOffice);
router.post("/:officeId/issue-visit-codes", requireAdminAuth, issueOfficeVisitCodes);
router.post("/:officeId/verify-visit-code", verifyOfficeVisitCode);

export default router;
