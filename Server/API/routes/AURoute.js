const {Login, SignUp, Logout} = require('../controllers/AuthenticationController');
const Router = require('express').Router;
const AuthenticationRoute = Router();
AuthenticationRoute.post('/signup', SignUp);
AuthenticationRoute.post('/login', Login);
AuthenticationRoute.get('/logout', Logout);
module.exports = AuthenticationRoute;