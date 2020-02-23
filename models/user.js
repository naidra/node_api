const mongoose = require('mongoose');

// Article schema
const usersSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { collection: 'users' });

module.exports = mongoose.model('Users', usersSchema);