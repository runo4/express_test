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

//ハッシュ化
const bcrypt = require('bcrypt');

//静的ファイルの配置場所
app.use(express.static('public'));
//urlエンコーディング
app.use(express.urlencoded({extended: false}));
//毎回行う処理(セッション情報保持確認)
app.use((req, res, next) => {
    if (req.session.userId) {
        res.locals.userId = req.session.userId;
        res.locals.userName = req.session.userName;
        res.locals.isLoggedIn = true;
    }else{
        res.locals.isLoggedIn = false;
    }
    next();
});

//---------------------------------------------------------------
app.get('/', (req, res) => {
    if(req.session.userId){
        res.redirect('/index');
    }else{
        res.render('top.ejs', {errMessage: undefined});
    }
});

app.post('/', (req, res) => {
    const loginId = req.body.loginId;
    const loginPassword = req.body.loginPassword;
    connection.query(
        'SELECT * FROM users WHERE user_id = ?',
        [loginId],
        (error, results) => {
            if(results.length > 0){
                // 該当ユーザーIDあり
                //入力されたパスワードとハッシュ化されたパスワードの比較
                bcrypt.compare(loginPassword, results[0].user_password, (error, isEqual) => {
                    if(isEqual){
                        // パスワード一致
                        req.session.userId = results[0].user_id;
                        req.session.userName = results[0].user_name;
    
                        res.redirect('/index');
                    }else{
                        res.render('top.ejs', {errMessage: 'IDかパスワードが違います'});
                    }
                });
            }else{
                res.render('top.ejs', {errMessage: 'IDかパスワードが違います'});
            }
        }
    );
});

app.get('/index', (req, res) => {
    if(req.session.userId){
        res.render('index.ejs');
    }else{
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        res.redirect('/');
    })
});

app.get('/register', (req, res) => {
    res.render('register.ejs', {errMessages: []});
});

app.post('/register', 
    (req, res, next) => {
        //入力文字数チェック
        const username = req.body.loginUserName;
        const userId = req.body.loginId;
        const password = req.body.loginPassword;
        const errMessages = [];

        if(username.length > 24){
            errMessages.push('ユーザー名は24文字以内で入力してください');
        }
        if(userId.length > 24 || userId.length < 4){
            errMessages.push('ユーザーidは4文字以上24文字以内で入力してください');
        }
        if(password.length > 32 || password.length < 8){
            errMessages.push('パスワードは8文字以上32文字以内で入力してください');
        }

        if(errMessages.length > 0){
            res.render('register.ejs', {errMessages: errMessages});
        }else{
            next();
        }
    },
    (req, res, next) => {
        //ユーザーIDの重複チェック
        const userId = req.body.loginId;
        const errMessages = [];

        connection.query(
            'SELECT * FROM users WHERE user_id = ?',
            [userId],
            (error, results) => {
                if(results.length > 0){
                    errMessages.push('ユーザーIDが既に存在します');
                    res.render('register.ejs', {errMessages: errMessages});
                }else{
                    next();
                }
            }
        )
    },
    (req, res, next) => {
        //パスワードと確認用パスワードの一致チェック
        const password = req.body.loginPassword;
        const rePassword = req.body.loginRePassword;
        const errMessages = [];

        if(password !== rePassword){
            errMessages.push('パスワードと確認用パスワードが一致しません');
            res.render('register.ejs', {errMessages: errMessages});
        }else{
            next();
        }
    },
    (req, res) => {
        //ユーザー登録
        const username = req.body.loginUserName;
        const userId = req.body.loginId;
        const password = req.body.loginPassword;
        //パスワードハッシュ化
        bcrypt.hash(password, 10, (error, hash) => {
            connection.query(
                'INSERT INTO users (user_id, user_password, user_name, created_at) VALUES (?, ?, ?, NOW());',
                [userId, hash, username],
                (error, results) => {
                    req.session.id = results.insertId;
                    req.session.userId = userId;
                    req.session.userName = username;
                    res.redirect('/index');
                }
            );
        });
    }
);

//---------------------------------------------------------------
app.listen(8080);