const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  const username = 'admin';
  const password = 'admin123';

  const hashed = await bcrypt.hash(password, 10);

  await db.execute(
    'INSERT INTO admin (username, password) VALUES (?, ?)',
    [username, hashed]
  );

  console.log('Admin créé avec succès');
  console.log('Username : admin');
  console.log('Password : admin123');
  process.exit();
};

createAdmin();
