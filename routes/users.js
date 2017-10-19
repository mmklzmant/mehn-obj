var express = require('express');

var mongoose = require('mongoose');
var validator = require('validator');
var pubfun    = require('../lib/common.model.js')
var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);
var userModel = require('../models/user.js');
var formidable = require('formidable');

var fs = require('fs');
const  AVATAR_UPLOAD_FOLDER = '/avatar/';

var router = express.Router();


//配置路由
router.get('/signin', function(req, res){
    res.render('users/signin');
});
router.get('/signup', function(req, res){
    res.render('users/signup');
});
router.get('/list', function (req, res) {
   res.render("users/list");
});
router.get("/profile", getProfile);

router.get("/show-user/:id", showUser);
router.get("/delete-user/:id", deleteUser);

router.post('/signin', checkeCaptcha, signIn);
router.post('/signup', checkPhone, checkPassword, checkeCaptcha, signup);
router.post('/get-users-list', getUsersList);
router.post('/upload-profile/:UID/:year/:month/:timestr', uploadProfile);
router.post("/save-profile", saveProfile);

function deleteUser(req, res){
    userModel.remove({_id: req.params.id}, function (err) {
        if(err){console.log(err)}
        else{
            var retData = {code: 1};
            res.send(retData);
        }
    });
}

//查询数据
function showUser(req, res) {
    let retData = {};
   userModel.find({_id: req.params.id}, function (err, users) {
      if(err) {
          retData.code = 0;
          retData.msg = err;
          return res.send(retData);
      }
      else{
         retData.code = 1;
         retData.url = "/users/profile";
         retData.users = users;
         return res.send(retData);
      }
   });
}
/**
 * 功能：登录
 * @param req
 * @param res
 */
function signIn(req, res) {
    userModel.find({phone: req.body.phone, hashed_password: pubfun.hashPW(req.body.pwd)},
        function (err, users) {
           if(err) {console.log(err)}
           else{
               var retData = {code: 1, url: "/users/profile", users: users};
               req.session.phone = req.body.phone;
               res.send(retData);
           }
        });
}

//更新数据
function saveProfile(req, res) {
    userModel.update({phone: req.body.phone},
        {$set: {gender: req.body.gender,
                email: req.body.email,
                nickName: req.body.nickName,
                realName: req.body.realName,
                loginName: req.body.loginName,
                age: req.body.age,
                address: req.body.address,
            update: true}},
        {upsert:false, multi: false})
        .exec(function (err, users) {
            if(err){console.log(err)}
            else{
                let retData = {code: 1,
                    url:"/users/profile"}
                return res.send(retData);
            }
        });
}

//处理上传文件
function uploadProfile(req,res) {
    console.log(req.body);
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');

        var extName = '';  //后缀名
        switch (files.photo.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        console.log(files);
        //req.params.timestr
        var newPath = 'public\\avatar_2\\'+req.params.timestr+"."+extName;

        fs.renameSync(files.photo.path, newPath);  //重命名
        //console.log(files.photo.path+"-----"+files.photo.name +"###"+ extName +"==="+req.params.year);
        //console.log('received fields:');
        var imgpath='/avatar_2/'+req.params.timestr+"."+extName;
        updateProfilePicture (req.params.UID,imgpath);

        //var data = {imgpath:imgpath};
        return  res.redirect('/users/profile?imgpath='+imgpath);
        // return  res.send(data);

    });
}

//更新个人俏像
function updateProfilePicture (UID,imgpath) {
    var data = {};

    userModel.update({phone:UID},
        {$set:{picture:imgpath,
            update:true}},
        {upsert:false,multi:false})
        .exec(function (err,users) {
            if(err){
                data = {msg: 'Update failure for '
                + UID,code:'0'};
            }else {

                data = {msg: 'Update successful for '
                + UID,code:'1'};
            }
            // res.send(data);
        });
}

//查询数据并传递数据到profile视图
function getProfile(req,res){
    if(req.session.phone)
    {
        userModel.find({phone:req.session.phone},
            function (err,users) {
                if(err){console.log(err);}
                else{
                    var retData = {users:users, code: 1}
                    var now         = new Date();
                    retData.UID     = req.session.phone;
                    retData.year    = now.getFullYear();
                    retData.month   = now.getMonth();
                    retData.timestr = Date.now();
                    if(req.xhr)
                    {
                        res.send(retData);
                    }
                    else{
                        res.render("users/profile", retData);
                    }
                }
            });
    }
}
//查询数据并发送到前端
function getUsersList(req,res) {
    var data = {};
    userModel.find({},function (err,users) {
        if(err) { console.log(err); }
        else
        {
            data = {code: 1,
                users: users};
            return res.send(data);
        }
    });
}

function checkPhone(req, res, next) {
    let retData = {};
    if(!validator.isMobilePhone(req.body.phone, "zh-CN"))
    {
        retData.code = 0;
        retData.msg = "请输入正确的电话号码";
        retData.id = "phone-error";
        return res.send(retData);
    }
    next();
}
function checkeCaptcha(req, res, next) {
    let retData = {};
    if(req.session.captcha.toLowerCase() !== req.body.vcode)
    {
        retData.code = 0;
        retData.msg = "验证码输入不正确serve";
        retData.id = "vcode-error";
        return res.send(retData);
    }
    next();
}
function checkPassword(req, res, next) {
    let retData = {};
    let ret = true;
    if(!validator.isLength(req.body.pwd, {min: 6, max: 20}))
    {
        ret = false;
        retData.code = 0;
        retData.id = "pwd-error";
        retData.msg = "请输入6到20位密码";
        return res.send(retData);
    }
    if(req.body.pwd !== req.body.repwd)
    {
        ret = false;
        retData.code = 0;
        retData.msg = "两次密码输入不正确";
        retData.id = "repwd-error";
        return res.send(retData);
    }
    if(ret)
    {
        next();
    }
}
function signup(req, res){
    let user = new userModel({phone:req.body.phone});
    user.set('hashed_password', pubfun.hashPW(req.body.pwd));
    user.set("email", req.body.phone + "@qq.com");
    user.save(function(err){
        if(err)
        {
            console.log(err);
        }
        else{
            let retData = {
                code : 1,
                msg: "success",
                url: "/users/profile"
            }
            req.session.phone = req.body.phone;
            return res.send(retData);
        }
    });
}
module.exports = router;