//backend/models/user.js
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// Fungsi untuk menghasilkan token JWT
const generateAuthToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_KEY, { expiresIn: "7d" });
};

// Fungsi untuk memvalidasi data login
const validateLogin = (data) => {
  const schema = Joi.object({
    nrp: Joi.string().required().label("NRP"), // Changed from 'nrp' to 'nrp'
    email: Joi.string().required().email().label("Email"),
  });
  return schema.validate(data);
};

// Fungsi login
const login = async (data) => {
  const { error } = validateLogin(data);
  if (error) throw new Error(error.details[0].message);

  // Normalize the input to uppercase
  const NRP = data.nrp.toUpperCase();
  const EMAIL = data.email.toLowerCase();

  try {
    const result = await sql.query`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_NAME] 
      WHERE NRP = ${NRP} AND EMAIL = ${EMAIL}
    `;
    const user = result.recordset[0];

    if (!user) throw new Error("User not found");

    // Update LastLogin timestamp
    await sql.query`
      UPDATE [DEPT_MANUFACTURING].[dbo].[USER_NAME] 
      SET LastLogin = GETDATE() 
      WHERE NRP = ${NRP}
    `;

    const token = generateAuthToken(user.NRP);
    return { token, user };
  } catch (error) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

// Ekspor fungsi
module.exports = {
  login,
  validateLogin,
  generateAuthToken,
};
