require('dotenv').config();

const express = require('express');
var cors = require('cors')
const app = express();
const {
    get_articles,
    add_article,
    update_article,
    delete_article,
    register_user,
    login_user
} = require('./routes/index');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cors()) // Enable cors

app.get('/articles', authenticateToken, get_articles);
app.get('/articles/add', authenticateToken, add_article);
app.post('/articles/update', authenticateToken, update_article);
app.delete('/articles/delete', authenticateToken, delete_article);
app.post('/register', ...register_user);
app.post('/login', login_user);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}