var express = require('express');
var router = express.Router();
var dbMssql = require('../common/db_mssql.js');


/**
 * 对数据进行md5加密
 * @param data
 */
function md5(data) {
    var crypto = require('crypto');
    var content = 'data';
    var md5 = crypto.createHash('md5');
    md5.update(content);
    var result = md5.digest('hex');
    return result;
}

// router.get('/', function (req, res, next) {
//     res.render('app', {
//         title: 'demo',
//         url: 'ss'
//     });
// });

/**
 * 用户登陆
 */
router.get('/login/:username/:password', function (req, res) {

    // res.set("Content-Type",'text/html');
    // res.send('<h1>some html</h1>');

    var username = req.params.username;
    var password = req.params.password;

    var passwordMd5 = md5(password);

    var sql = 'select * from Operator where LoginName = @username and Password = @password';
    var db = new dbMssql();
    db.FindByCustom(sql, {
            'username': username,
            'password': '202CB962AC5975B964B7152D234B70'
        }, function (r) {
            res.json(r);
        }
    )
});

/**
 * 获取所有的科室
 */
router.get('/getOffices', function (req, res) {
    var sql = 'select * from Office';
    var db = new dbMssql();
    db.Find(sql, function (r) {
        res.json(r);
    });
});

/**
 * 用户注册
 */
router.get('/register/:username/:password', function (req, res) {

    var username = req.params.username;
    var password = req.params.password;

    var sql = 'insert into Operator (OperatorID, StaffID, LoginName, Password, Grade) values ' +
        '(@operatorId, @staffId, @loginName, @password, @grade)';
    var db = new dbMssql();
    db.FindByCustom(sql, {
            'operatorId': '122341',
            'staffId': '131312',
            'loginName': username,
            'password': '202CB962AC5975B964B7152D234B70',
            'grade': '234'
        }, function (r) {
            res.json(r);
        }
    )
});

/**
 * 获取敏感表结构
 */
router.get('/getSensitives/:reportFormId', function (req, res) {
    var reportFormId = req.params.reportFormId;

    var sql = 'select * from Sensitive where ReportFormId = @reportFormId';
    var db = new dbMssql();
    db.FindByCustom(sql, {
            'reportFormId': reportFormId,
        }, function (r) {
            res.json(r);
        }
    )
});

/**
 * 获取上报表单数据
 */
router.get('/getReportForms', function (req, res) {
    var db = new dbMssql();
    var sql = 'select * from ReportForm';
    db.Find(sql, function (r) {
        res.json(r);
    });
});

/**
 * 上传一次的表单内容
 */
router.post('/postFormData', function (req, res) {
    // res.header("Access-Control-Allow-Origin", "*");
    // var username = req.body.username;
    // var password = req.body.password;
    // console.log('username:' + username);
    // console.log('password:' + password);
    var json = JSON.stringify({var1: 'testHAHA', var2: 3});
    var params = 'user=' + json;


    res.json(params);
});




router.get('/', function (req, res, next) {
    var db = new dbMssql();
    var sql = 'select * from office';
    db.Find(sql, function (r) {
        res.json(r);
    });
});


router.get('/:officeId', function (req, res, next) {
    var officeId = req.params.officeId;
    console.log('officeId = ' + officeId)
    var sql = 'select * from office where officeId = @id';
    var db = new dbMssql();
    db.FindByCustom(sql,
        {"id": officeid},
        function (r) {
            res.json(r);
        }
    )
});


// router.get('/:officeid', function (req, res, next) {
//     var officeid = req.params.officeid;
//     console.log('officeid =' + officeid)
//     var sql = 'select * from office where officeid = @id';
//     var db = new dbMssql();
//     db.FindByCustom(sql,
//         {"id": officeid},
//         function (r) {
//             res.json(r);
//         }
//     )
// });


// router.get('/:userid',loadUserid);

function loadAll(req, res, next) {
    var db = new dbMssql();
    var sql = 'select * from office';
    db.Find(sql,
        function (r) {
            res.json(r);
        });
}

// function loadUserid(req,res,next){
//     var userid = req.params.userid;
//     var db = new dbMssql();
//     var sql = "select * from User where UserId = @id ";
//     db.FindByCustom(sql,
//         {"id":userid},
//         function(r){
//             //res.json(r);
//             if(r.result > 0){
//                 next();

//             }
//         }    
//     )
// }


module.exports = router;