const router = require("express").Router();

router.post("/", (_, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  res.status(200).json({ message: "Signed out successfully" });
});

module.exports = router;
