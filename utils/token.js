const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      type: "access"
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m"
    }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      type: "refresh"
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

module.exports = {
  createAccessToken,
  createRefreshToken
};