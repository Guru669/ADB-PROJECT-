const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("--- REGISTRATION ATTEMPT ---");
  console.log("Body:", req.body);
  try {
    const { fullName, email, password, studentId, staffId, department, section, role, phone, address, currentYear, currentSemester, cgpa, specialization, dob, gender, umisNumber, subjects } = req.body;

    // Basic validation
    if (!email) {
      console.log("Validation failed: Email missing");
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const normalizedRole = (role || 'student').toLowerCase();
    if (normalizedRole === 'student' && !studentId) return res.status(400).json({ message: 'studentId is required for students' });
    if (normalizedRole === 'staff' && !staffId) return res.status(400).json({ message: 'staffId is required for staff' });

    // Check if user exists with same email, studentId or staffId
    const query = [{ email }];
    if (studentId) query.push({ studentId });
    if (staffId) query.push({ staffId });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      console.log("User already exists:", existingUser.email);
      if (existingUser.email === email) return res.status(400).json({ message: 'Email already registered' });
      if (studentId && existingUser.studentId === studentId) return res.status(400).json({ message: 'Student ID already registered' });
      if (staffId && existingUser.staffId === staffId) return res.status(400).json({ message: 'Staff ID already registered' });
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log("Creating new user...");
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hash,
      studentId,
      staffId,
      department,
      section,
      phone,
      address,
      currentYear,
      currentSemester,
      cgpa,
      specialization,
      dob,
      gender,
      umisNumber,
      subjects,
      role: normalizedRole,
      portfolio: {
        isPublic: true,
        profilePhoto: '',
        bio: '',
        skills: [],
        achievements: [],
        certificates: [],
        projects: [],
        journals: []
      }
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    res.json({ message: 'User Registered', user: userToReturn, token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  try {
    const { identifier, password } = req.body;

    // Find user by email, studentId, or staffId
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { studentId: identifier },
        { staffId: identifier }
      ]
    });

    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json("Wrong password");

    const token = jwt.sign({ id: user._id, role: user.role }, "secret", { expiresIn: '24h' });
    const userToReturn = user.toObject();
    delete userToReturn.password;
    res.json({ token, user: userToReturn });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json(err.message);
  }
});

router.post("/forgot-password", async (req, res) => {
  console.log("Forgot password request:", req.body);
  try {
    const { identifier, newPassword } = req.body;
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { studentId: identifier },
        { staffId: identifier }
      ]
    });

    if (!user) return res.status(404).json("User not found");

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return res.json({ message: "Password reset successfully" });
    }

    res.json({ message: "Password reset instructions simulated. (In a real app, an email would be sent)." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json(err.message);
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.delete("/students/:email", async (req, res) => {
  try {
    await User.findOneAndDelete({ email: req.params.email, role: 'student' });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.delete("/students", async (req, res) => {
  try {
    await User.deleteMany({ role: 'student' });
    res.json({ message: "All students deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.put("/update-profile", async (req, res) => {
  try {
    const { email, fullName, department, section, phone, address, currentYear, currentSemester, cgpa, specialization, advisorName, dob, gender, umisNumber, subjects } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { 
        fullName, 
        department, 
        section,
        phone,
        address,
        currentYear,
        currentSemester,
        cgpa,
        specialization,
        advisorName,
        dob,
        gender,
        umisNumber,
        subjects
      } },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

router.put("/bulk-update-profile", async (req, res) => {
  try {
    const { emails, advisorName } = req.body;
    console.log(`Bulk assigning ${advisorName} to ${emails?.length} students`);
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "Valid emails array is required" });
    }

    const result = await User.updateMany(
      { email: { $in: emails } },
      { $set: { advisorName: advisorName || "" } }
    );

    console.log("Bulk update result:", result);
    res.json({ message: `Successfully assigned to ${result.modifiedCount || emails.length} students` });
  } catch (err) {
    console.error("Bulk update error detail:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.put("/update-portfolio", async (req, res) => {
  try {
    const { email, portfolio } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!portfolio) return res.status(400).json({ message: "Portfolio data is required" });

    // Only persist safe, non-image fields to the database
    // Base64 images stay in localStorage (too large for DB without file storage)
    const safePortfolio = {
      "portfolio.isPublic": portfolio.isPublic ?? true,
      "portfolio.bio": portfolio.bio || "",
      "portfolio.profilePhoto": portfolio.profilePhoto || "",
      "portfolio.skills": (portfolio.skills || []).map(s =>
        typeof s === "string" ? { name: s, level: 80 } : { name: s.name, level: s.level }
      ),
      "portfolio.achievements": (portfolio.achievements || []).map(a => ({
        id: a.id, title: a.title, description: a.description, date: a.date, file: a.file || ""
      })),
      "portfolio.certificates": (portfolio.certificates || []).map(c => ({
        id: c.id, title: c.title, issuer: c.issuer, date: c.date, link: c.link, file: c.file || ""
      })),
      "portfolio.projects": (portfolio.projects || []).map(p => ({
        id: p.id, title: p.title, description: p.description, technologies: p.technologies, link: p.link, presentationPhoto: p.presentationPhoto || "", file: p.file || "", journalFile: p.journalFile || "", certificateFile: p.certificateFile || ""
      }))
    };

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: safePortfolio },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Portfolio saved successfully", user: updatedUser });
  } catch (err) {
    console.error("Update portfolio error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;
