const express = require("express");
const { getCalendarSummary } = require("../controllers/calendarController");

const router = express.Router();

// GET /calendar?year=2026&month=7
router.get("/", getCalendarSummary);

module.exports = router;
