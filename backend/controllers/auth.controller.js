const authService = require("../services/AuthService");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const data = await authService.login(username, password);

    res.json(data);
  } catch (error) {
    console.log("error: ",error);
    
    res.status(401).json({ message: error.message });
  }
};
