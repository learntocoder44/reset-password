import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifytoken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (userpassword) {
  try {
    return await bcrypt.compare(userpassword, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
