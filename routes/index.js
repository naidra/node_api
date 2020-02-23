const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Article = require('../models/article');
const User = require('../models/user');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = mongoose.connection;

db.once('open', () => console.log('Connected to Mongodb database.')); // Check when db is connected
db.on('error', err => console.log(`DB didn't connect. ${err}`)); // Check for DB errors

module.exports = {
    // Get
    get_articles: (req, res) => {
        Article.find({}, (err, articles) => {
            if (err) console.log(err);
            else res.json(articles);
        });
    },
    // Post
    add_article: [
        [
            check('title', 'Title field is required').notEmpty(),
            check('body', 'Body field is required').notEmpty()
        ], (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.send(errors);
            } else {
                const article = new Article({
                    title: req.body.title,
                    author: req.user.username,
                    author_id: req.user.id,
                    body: req.body.body
                });
                article.save(err => {
                    if (err) console.log(err);
                    else res.status(201).send('Article has been created.');
                });
            }
        }
    ],
    // Post
    update_article: (req, res) => {
        const article = {
            title: req.body.title,
            author: req.user.username,
            body: req.body.body
        };
        const query = { _id: req.body.id };
        Article.updateOne(query, article, err => {
            if (err) console.log(err);
            else res.status(202).send('Article has been changed.');
        });
    },
    // Delete
    delete_article: (req, res) => {
        const query = { _id: req.body.id };

        Article.deleteOne(query, err => {
            if (err) {
                res.status(304).send({ error: err });
                console.log(err);
            } else res.status(202).send('Article deleted successfully.');
        });
    },
    //Post
    register_user: [
        [
            check('username', 'Title field is required').notEmpty(),
            check('email', 'Email field is required').isEmail(),
            check('password', 'Password field is required to be minimum 8 characters').notEmpty().isLength({ min: 8 }),
            check('password2', 'Passwords most match').custom((value, { req, loc, path }) => {
                if (value !== req.body.password)
                    throw new Error("Passwords don't match");
                else return value;
            }),
        ],
        (req, res) => {
            const query = { $or: [{ email: req.body.email }, { username: req.body.username }] };
            User.findOne(query, async (err, user) => {
                if (!user) {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        res.send(errors);
                    } else {
                        try {
                            const newUser = new User({
                                username: req.body.username,
                                email: req.body.email,
                                password: req.body.password
                            });
                            const hashedPassword = await bcrypt.hash(newUser.password, 10);
                            newUser.password = hashedPassword;
                            newUser.save(err => {
                                if (err) {
                                    res.status()
                                }
                                else res.status(201).send('User has been registered.');
                            });
                        } catch (err) {
                            res.status(500).send("Something went wrong saving user.");
                        }
                    }
                } else res.json({ msg: 'Already exists one user registered with this username or this email.' });
            });
        }
    ],
    // Post
    login_user: (req, res) => {
        const query = { email: req.body.email };
        User.findOne(query, async (err, user) => {
            if (err) return res.send({ errors: { msg: 'No user found' } });
            if (user && await bcrypt.compare(req.body.password, user.password)) {
                const userForToken = { name: user.username, email: user.email, id: user.id };
                const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
                res.json({ accessToken });
            } else {
                res.json({ msg: 'User not found' });
            }
        });
    }
}