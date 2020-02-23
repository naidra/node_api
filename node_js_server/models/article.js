const mongoose = require('mongoose');

// Article schema
const articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    author_id: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, { collection: 'articles' });

module.exports = mongoose.model('Article', articleSchema);