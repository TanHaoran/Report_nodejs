var express = require('express');
var router = express.Router();
var dbMssql = require('../common/db_mssql.js');
var async = require('async');


/**
 * 对数据进行md5加密
 * @param data
 */
function md5(data) {
    var crypto = require('crypto');
    var content = data;
    var md5 = crypto.createHash('md5');
    md5.update(content);
    var result = md5.digest('hex');
    return result;
}

/**
 * 测试方法
 */
router.get('/test', function (req, res) {

    var db = new dbMssql();
    var action = [];
    action.push(function(next){
        db.Find("select * from Operator where LoginName='000'", function (resultA,err) {
            next(err,resultA);
        });
    });
    action.push(function(resultA,next){
        if(true) {
            next(new Error('sss'), resultA);
        }else {
            db.Find("insert into Operator where LoginName='zl'", function (resultB, err) {
                next(err, resultA, resultB);
            });
        }
    });
    action.push(function(resultA, resultB,next){
        console.log('222');
        next(err, resultA, resultB);
    });

    async.waterfall(action, function (err, resultA, resultB) {    //瀑布的每一布，只要cb(err, data)的err发生，就会到这
        if(err)
        {
            console.log('处理错误!');
            res.json(err.message);
        }
        else
        {
            console.log('处理成功！');
            res.json('ok');
        }
    });
});


/**
 * 用户登陆
 */
router.post('/login', function (req, res) {

    var data = req.body.data;
    var user = JSON.parse(data);

    var username = user.username;
    var password = user.password;

    var passwordMd5 = md5(password);

    var sql = 'select * from Operator where LoginName = @username and Password = @password';
    var db = new dbMssql();
    db.FindByCustom(sql, {
            'username': username,
            'password': passwordMd5
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
 * 上传一天的表单内容
 */
router.post('/postFormData', function (req, res) {
    var data = req.body.data;
    var object = JSON.parse(data);
    console.log('所有数据：' + data);
    for (var i = 0; i < object.length; i++) {
        // 敏感事件id
        var sensitiveId = object[i].sensitiveId;
        // 敏感事件人数
        var people = object[i].people;
        var sql = 'insert into SensitiveData (SensitiveId, People, SensitiveDate, OperatorId, EditTime) values ' +
            '(@sensitiveId, @people, @sensitiveDate, @operatorId, @editTime)';
    }
    res.json('success');
});


// router.get('/', first, scend);
//
// function first(req, res, next) {
//     var db = new dbMssql();
//     var sql = 'select * from office';
//     db.Find(sql, function (r) {
//         res.json(r);
//         next();
//     });
// }
// function scend(req, res, next) {
//     var db = new dbMssql();
//     var sql = 'select * from office';
//
//     db.Find(sql, function (r) {
//         res.json(r);
//     });
// }

router.get('/:officeId', function (req, res, fff) {
    var officeId = req.params.officeId;
    console.log('officeId = ' + officeId)
    var sql = 'select * from office where officeId = @id';
    var db = new dbMssql();
    db.FindByCustom(sql,
        {"id": officeid},
        function (r) {
            res.json(r);
            fff();
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