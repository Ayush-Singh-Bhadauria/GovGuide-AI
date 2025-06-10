const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  hashed_password: {
    type: String,
    required: true,
  },
  dob: String,
  gender: String,
  phone: String,
  aadhaarLinked: String,
  address: String,
  state: String,
  district: String,
  pincode: String,
  ruralUrban: String,
  casteCategory: String,
  familyIncome: String,
  bplCard: String,
  rationCardType: String,
  ewsStatus: String,
  disability: String,
  disabilityType: String,
  maritalStatus: String,
  highestQualification: String,
  currentlyStudying: String,
  course: String,
  studentId: String,
  collegeName: String,
  employed: String,
  profession: String,
  unemployedYouth: String,
  selfEmployed: String,
  skillCertificate: String,
  bankLinked: String,
  accountHolder: String,
  bankName: String,
  ifsc: String,
  upi: String,
  farmer: String,
  landOwnership: String,
  landArea: String,
  pregnantMother: String,
  seniorCitizen: String,
  minority: String,
  minorityReligion: String,
  interestedCategories: [String],
  languages: [String],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("hashed_password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.hashed_password = await bcrypt.hash(this.hashed_password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;