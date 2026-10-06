const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Blacklist = require("../models/Blacklist");
const auth = require("../middleware/auth");

const {
  createAccessToken,
  createRefreshToken
} = require("../utils/token");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed"
    });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const refreshToken = req.body.refreshToken;

    const accessDecoded = jwt.decode(accessToken);

    if (accessDecoded) {
      await Blacklist.create({
        token: accessToken,
        type: "access",
        expiresAt: new Date(accessDecoded.exp * 1000)
      });
    }

    if (refreshToken) {
      const refreshDecoded = jwt.decode(refreshToken);

      if (refreshDecoded) {
        await Blacklist.create({
          token: refreshToken,
          type: "refresh",
          expiresAt: new Date(refreshDecoded.exp * 1000)
        });
      }
    }

    res.json({
      message: "Logout successful"
    });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed"
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required"
      });
    }

    const blacklisted = await Blacklist.findOne({
      token: refreshToken
    });

    if (blacklisted) {
      return res.status(401).json({
        message: "Refresh token is blacklisted"
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const newAccessToken = createAccessToken(user);

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }
});

module.exports = router;