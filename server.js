import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import sequelize from './config/db.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Sequelize with Express!');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User was registered successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error when registering user',
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    if (user.mustChangePassword) {
      return res.json({
        message: 'You must change your password',
      });
    }

    res.json({
      message: 'User was logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error when login user',
    });
  }
});

app.post('/change-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error when changing password',
    });
  }
});

app.post('/delete-account', async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    await user.destroy();

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error when deleting account',
    });
  }
});

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database established successfully.');
    console.log(`Server is runnning at http://127.0.0.1:${port}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
