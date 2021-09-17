const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('top.ejs');
});

app.post('/login', (req, res) => {
    res.render('top.ejs');
});

app.listen(8080);