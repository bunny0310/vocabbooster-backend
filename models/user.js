const {mongoose_connection} = require("../config");

const mongoose = mongoose_connection();

const {Word} = require("../models/word");

const schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    password: String,
    words: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Word"
    }],
    createdAt: {type: Date, default: Date.now()},
})

const User = new mongoose.model('User', schema);

module.exports = {User};

