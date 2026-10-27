require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const app = express();
app.use(cors()); app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/employees', require('./routes/employees'));
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log('Server on ' + PORT)))
  .catch(err => console.error(err));