mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {type :String, required: true, unique: true},
    password: {type :String, required: true},
    email: {type :String, required: true, unique: true},
    role: {type :String, required: true, default: 'user'},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);