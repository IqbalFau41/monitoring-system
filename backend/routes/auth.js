//backend/routes/auth.js
const router = require("express").Router();
const { login } = require("../models/user");

// Rute untuk login
router.post("/login", async (req, res) => {
  try {
    const { token, user } = await login(req.body);
    res.status(200).send({ token, message: "Logged in successfully", user });
  } catch (error) {
    console.error("Error during login:", error);
    if (error.message === "User not found") {
      return res.status(401).send({ message: "Invalid NRP or Email" });
    }
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
