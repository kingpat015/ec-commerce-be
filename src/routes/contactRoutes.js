const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");
const {
  createContactSubmission,
  getContactSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
} = require("../controllers/contactController");

// Public route - anyone can submit
router.post("/", createContactSubmission);

// Protected routes - admin and HR only
router.get(
  "/",
  authenticate,
  authorize("admin", "hr_user"),
  getContactSubmissions,
);

router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "hr_user"),
  updateSubmissionStatus,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "hr_user"),
  deleteSubmission,
);

module.exports = router;
