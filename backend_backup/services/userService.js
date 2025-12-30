import User from '../models/User.js';

export default {
  createUser: async (data) => {
    // Filter and validate data
    const userData = {
      name: data.name,
      phone: data.phone,
      occupation: data.occupation,
      idType: data.idType,
      idNumber: data.idNumber,
    };
    
    // Only include email if provided
    if (data.email && data.email.trim()) {
      userData.email = data.email.trim().toLowerCase();
    }
    
    const user = new User(userData);
    await user.save();
    return user;
  },
  
  getUserById: async (id) => {
    return await User.findById(id);
  },
};