const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  studentId: String,
  staffId: String,
  dob: String,
  gender: String,
  umisNumber: String,
  department: String,
  section: String,
  phone: String,
  address: String,
  currentYear: String,
  currentSemester: String,
  cgpa: String,
  specialization: String,
  advisorName: { type: String, default: "" },
  subjects: { type: Array, default: [] },
  role: { type: String, default: 'student' },
  portfolio: {
    isPublic: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    profilePhoto: String,
    bio: String,
    skills: { type: Array, default: [] },
    achievements: { type: Array, default: [] },
    certificates: { type: Array, default: [] },
    projects: { type: Array, default: [] },
    journals: { type: Array, default: [] }
  }
}, { timestamps: true });


module.exports = mongoose.model("User", UserSchema);
