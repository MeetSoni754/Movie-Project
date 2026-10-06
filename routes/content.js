const express = require("express");

const Content = require("../models/Content");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const checkSubscription = require("../utils/subscription");

const router = express.Router();

router.get("/free", auth, async (req, res) => {
  try {
    const content = await Content.find({
      category: "free"
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({
      message: "Could not get free content"
    });
  }
});

router.get("/premium", auth, async (req, res) => {
  try {
    const user = await checkSubscription(req.user);

    if (
      user.subscriptionPlan !== "premium" &&
      user.subscriptionPlan !== "pro"
    ) {
      return res.status(403).json({
        message: "Premium or Pro subscription required"
      });
    }

    const content = await Content.find({
      category: "premium"
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({
      message: "Could not get premium content"
    });
  }
});

router.post("/", auth, admin, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!["free", "premium"].includes(category)) {
      return res.status(400).json({
        message: "Invalid category"
      });
    }

    const content = await Content.create({
      title,
      description,
      category
    });

    res.status(201).json({
      message: "Content created successfully",
      content
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not create content"
    });
  }
});

router.put("/:id", auth, admin, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category
      },
      {
        new: true
      }
    );

    if (!content) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    res.json({
      message: "Content updated successfully",
      content
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update content"
    });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(
      req.params.id
    );

    if (!content) {
      return res.status(404).json({
        message: "Content not found"
      });
    }

    res.json({
      message: "Content deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete content"
    });
  }
});

module.exports = router;