/**
 * Server entry - loads config and starts Express.
 * Run: npm start or npm run dev
 */
require('dotenv').config();
const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Rural Uber Farm Assets API running on port ${config.port}`);
});
