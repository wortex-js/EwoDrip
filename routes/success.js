import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("success");
});

export default router;
