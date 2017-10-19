var express = require('express');
var svgCaptcha = require('svg-captcha');

var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);

var router = express.Router();

//配置路由
//第一个参数用单引号
router.get('/', function(req, res){
    res.render('home');
});
router.get('/about', function(req, res){
    res.render('about', {users: [{name: 'jack', age: 23},
        {name: 'Bill', age: 33}]});
});
router.get('/contact', function(req, res){
    //不能以斜杠开头
    res.render('contact');
});
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    
    res.type('svg');
    res.status(200).send(captcha.data);
});

router.post('/send-email', function(req, res){
    emailService.send(req.body.to, req.body.subj, req.body.body);
});

module.exports = router;