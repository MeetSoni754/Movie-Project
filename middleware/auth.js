const jwt = require("jsonwebtoken");
const Blacklist = require("../models/Blacklist");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "Token required"
      });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token required"
      });
    }

    const blacklisted = await Blacklist.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({
        message: "Token is blacklisted"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    if (decoded.type !== "access") {
      return res.status(401).json({
        message: "Invalid access token"
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = auth;