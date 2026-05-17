import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Sequelize with Express!');
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
