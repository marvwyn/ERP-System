const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  
  async login(username, password) {
    const user = await User.findOne({ username });
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return this.generateToken(user);
  }


  generateToken(user) {
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    };
  }
}

module.exports = new AuthService();
