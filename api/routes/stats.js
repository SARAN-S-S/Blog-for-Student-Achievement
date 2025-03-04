// api/routes/stats.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const moment = require("moment");

// Get user statistics
router.get("/users", async (req, res) => {
  try {
    // Count students and admins
    const students = await User.countDocuments({ role: "student" });
    const admins = await User.countDocuments({ role: "admin" });

    // Get all users with their post counts
    const users = await User.find({}, "username email").lean();
    const postsByUser = await Post.aggregate([
      { $group: { _id: "$username", count: { $sum: 1 } } },
    ]);

    // Map users with their post counts
    const usersWithPosts = users.map((user) => {
      const postCount = postsByUser.find((p) => p._id === user.username)?.count || 0;
      return { ...user, postCount };
    });

    res.status(200).json({ students, admins, users: usersWithPosts });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get post statistics
router.get("/posts", async (req, res) => {
  try {
    // Count total posts
    const totalPosts = await Post.countDocuments();

    // Count posts by event type
    const postsByEventType = await Post.aggregate([
      { $unwind: "$tags" },
      { $match: { tags: { $in: ["Project", "Patent", "Paper", "Journal", "Competition"] } } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);

    // Count posts by student year
    const postsByYear = await Post.aggregate([
      { $unwind: "$tags" },
      { $match: { tags: { $in: ["First Year", "Second Year", "Third Year", "Final Year"] } } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);

    res.status(200).json({ totalPosts, postsByEventType, postsByYear });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get monthly post statistics
router.get("/monthly-posts", async (req, res) => {
  const { month, year } = req.query;
  try {
    const matchQuery = {};
    if (month) matchQuery.$expr = { $eq: [{ $month: "$createdAt" }, parseInt(month)] };
    if (year) matchQuery.$expr = { $eq: [{ $year: "$createdAt" }, parseInt(year)] };

    const monthlyPosts = await Post.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalPosts = await Post.countDocuments(matchQuery);

    // If no posts exist for the selected month/year, return default data
    if (monthlyPosts.length === 0) {
      return res.status(200).json({
        posts: [{ _id: 1, count: 0, monthName: "No Data", percentage: "0.00" }],
        totalPosts: 0,
      });
    }

    const formattedMonthlyPosts = monthlyPosts.map((post) => ({
      ...post,
      monthName: moment().month(post._id - 1).format("MMMM"),
      percentage: ((post.count / totalPosts) * 100).toFixed(2),
    }));

    res.status(200).json({ posts: formattedMonthlyPosts, totalPosts });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;