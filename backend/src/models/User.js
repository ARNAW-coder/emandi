import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
  type: String,
  trim: true,
  lowercase: true,
  // sparse: true, // Allow multiple nulls
  //     unique: true,
  default: null,
},
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["FARMER", "MANDI_ADMIN", "GOVT_OFFICER"],
      required: true,
      default: "FARMER",
    },
    mandiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mandi",
      default: null,
    },
  },
  { timestamps: true }
);



// Hash password before saving, but only if it was changed/new
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Instance method to compare a plaintext password against the hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak the password hash in API responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;