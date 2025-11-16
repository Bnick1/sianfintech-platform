import userService from "../services/userService.js";

export const registerUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      status: "success",
      user
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ status: "success", message: "User deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
