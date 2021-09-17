const express = require('express');
const app = express();

const mysql = require('mysql');
//const connection = mysql.createConnection({});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('top.ejs');
});

app.post('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.listen(8080);