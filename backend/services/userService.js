import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default {
  createUser: async (data) => {
    const user = new User(data);
    await user.save();
    return user;
  },
  getUserById: async (id) => {
    return await User.findById(id);
  },
  deleteUser: async (id) => {
    return await User.findByIdAndDelete(id);
  }
};
