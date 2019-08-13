const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.use('/src', express.static('src'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/index.html')));

app.listen(port, () => console.log(`The server is listening on port ${port}!`));
