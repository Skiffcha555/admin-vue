// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const settingsFilePath = './settings.json';

app.get('/api/settings', (req, res) => {
  fs.readFile(settingsFilePath, (err, data) => {
    if (err) {
      res.status(500).send('Error reading settings.');
    } else {
      res.send(data);
    }
  });
});

app.post('/api/settings', (req, res) => {
  fs.writeFile(settingsFilePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      res.status(500).send('Error writing settings.');
    } else {
      res.send({ status: 'success' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
