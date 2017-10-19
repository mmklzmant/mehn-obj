var express = require("express");
var router = express.Router();

var cmsModel = require('../models/cms.js');

//路由配置
router.get("/list", function (req, res) {
    res.render("cms/list");
});

router.post("/get-cms-list", getCmsList);


function getCmsList(req, res) {
    var data = {};
    cmsModel.find({}, function (err, users) {
       if(err) {
           data.code = 0;
           return res.send(data);
       }
       else{
           data.code = 1;
           data.users = users;
           return res.send(data);
       }
    });
}
module.exports = router;