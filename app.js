const express = require('express');
const app = express();

// テンプレートエンジンの指定
app.set("view engine", "ejs");

//mysqlへの接続
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'member_site_testdb'
});
//mysql接続失敗時の出力
connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
});

//セッション
const session = require('express-session');
app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
);

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use((req, res, next) => {
    if (req.session.id) {
        res.locals.id = req.session.id;
        res.locals.userId = req.session.userId;
        res.locals.userName = req.session.userName;
    }
    next();
});

//---------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('top.ejs', {
        errMessage: undefined, 
        userId: undefined
    });
});

app.post('/', (req, res) => {
    const loginId = req.body.loginId;
    connection.query(
        'SELECT * FROM users WHERE user_id = ?',
        [loginId],
        (error, results) => {
            if(results.length > 0){
                // 該当ユーザーIDあり
                if(req.body.loginPassword === results[0].user_password){
                    // パスワード一致
                    req.session.id = results[0].id;
                    req.session.userId = results[0].user_id;
                    req.session.userName = results[0].user_name;

                    res.redirect('/index');
                }else{
                    res.render('top.ejs', {
                        errMessage: 'パスワードが一致しません', 
                        userId: loginId
                    });
                }
            }else{
                res.render('top.ejs', {
                    errMessage: '該当するユーザIDがありません', 
                    userId: undefined
                });
            }
        }
    );
});

app.get('/index', (req, res) => {
    res.render('index.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});
//---------------------------------------------------------------
app.listen(8080);