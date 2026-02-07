require("dotenv").config();
const connectDB = require("./config/db.js");
const app = require("./src/app");
connectDB();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
