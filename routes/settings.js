import express from "express";
const router = express.Router();

/**
 * GET /settings
 * Renders the settings page.
 */
router.get("/", (req, res) => {
  res.render("settings", {
    title: "Settings | EwoDrip",
    cartCount: 0, // optional: you can replace with real cart count later
  });
});

/**
 * POST /settings/update
 * Handles form submissions from the settings page.
 */
router.post("/update", (req, res) => {
  const { theme, currency, language } = req.body;

  console.log("User settings updated:");
  console.log({ theme, currency, language });

  // In a real app, you’d save these preferences to a database or session
  res.redirect("/settings");
});

export default router;
