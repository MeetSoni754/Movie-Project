const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const checkSubscription = require("../utils/subscription");

const router = express.Router();

router.post("/subscribe", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!["free", "premium", "pro"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid plan"
      });
    }

    await checkSubscription(req.user);

    if (
      req.user.subscriptionPlan !== "free" &&
      req.user.subscriptionExpiresAt > new Date()
    ) {
      return res.status(400).json({
        message: "You already have an active subscription. Use renew."
      });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    req.user.subscriptionPlan = plan;
    req.user.subscriptionExpiresAt = expiryDate;

    await req.user.save();

    res.json({
      message: "Subscription purchased successfully",
      plan: req.user.subscriptionPlan,
      expiresAt: req.user.subscriptionExpiresAt
    });
  } catch (error) {
    res.status(500).json({
      message: "Subscription failed"
    });
  }
});

router.get("/subscription-status", auth, async (req, res) => {
  try {
    const user = await checkSubscription(req.user);

    let discount = 0;

    if (user.subscriptionPlan === "pro") {
      discount = 20;
    }

    res.json({
      plan: user.subscriptionPlan,
      expiresAt: user.subscriptionExpiresAt,
      discount
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not get subscription status"
    });
  }
});

router.patch("/renew", auth, async (req, res) => {
  try {
    await checkSubscription(req.user);

    if (
      req.user.subscriptionPlan === "free" ||
      !req.user.subscriptionExpiresAt
    ) {
      return res.status(400).json({
        message: "No active subscription to renew"
      });
    }

    const expiryDate = new Date(req.user.subscriptionExpiresAt);
    expiryDate.setDate(expiryDate.getDate() + 30);

    req.user.subscriptionExpiresAt = expiryDate;

    await req.user.save();

    res.json({
      message: "Subscription renewed successfully",
      plan: req.user.subscriptionPlan,
      expiresAt: req.user.subscriptionExpiresAt
    });
  } catch (error) {
    res.status(500).json({
      message: "Renewal failed"
    });
  }
});

router.post("/cancel-subscription", auth, async (req, res) => {
  try {
    req.user.subscriptionPlan = "free";
    req.user.subscriptionExpiresAt = null;

    await req.user.save();

    res.json({
      message: "Subscription cancelled successfully",
      plan: "free"
    });
  } catch (error) {
    res.status(500).json({
      message: "Cancellation failed"
    });
  }
});

module.exports = router;