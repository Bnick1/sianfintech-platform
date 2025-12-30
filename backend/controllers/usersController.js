import userService from '../services/userService.js';

export async function registerUser(req, res) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'User registered', user });
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await userService.getUserById(req.params.userId);
    if (!user) throw { status: 404, message: 'User not found' };
    res.status(200).json(user);
  } catch (e) {
    res.status(e.status || 500).json({ status: 'error', message: e.message });
  }
}
