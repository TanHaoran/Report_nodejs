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
    action.push(function (next) {
        db.Find("select * from Operator where LoginName='000'", function (resultA, err) {
            next(err, resultA);
        });
    });
    action.push(function (resultA, next) {
        if (true) {
            next(new Error('sss'), resultA);
        } else {
            db.Find("insert into Operator where LoginName='zl'", function (resultB, err) {
                next(err, resultA, resultB);
            });
        }
    });
    action.push(function (resultA, resultB, next) {
        console.log('222');
        next(err, resultA, resultB);
    });

    async.waterfall(action, function (err, resultA, resultB) {
        if (err) {
            console.log('处理错误!');
            res.json(err.message);
        }
        else {
            console.log('处理成功！');
            res.json('ok');
        }
    });
});


/**
 * 用户登陆(post方法)
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
 * 获取所有的科室(get)
 */
router.get('/getOffices', function (req, res) {
    var sql = 'select * from Office';
    var db = new dbMssql();
    db.Find(sql, function (r) {
        res.json(r);
    });
});

/**
 * 用户注册(post方法)
 */
router.post('/register', function (req, res) {

    var data = req.body.data;
    var user = JSON.parse(data);

    var username = user.username;
    var password = user.password;

    var db = new dbMssql();
    var action = [];
    // 1. 首先查询Seed表中最大Operator的MaxNo
    action.push(function (next) {
        console.log('第1步');
        db.Find("select MaxNo from Seed where TableName='OPERATOR'", function (resultMaxNo, error) {
            if (resultMaxNo[0].MaxNo >= 0) {
                next(error, resultMaxNo[0].MaxNo);
            }
        });
    });

    // 2. 更新Seed表的Operator的MaxNo
    action.push(function (maxNo, next) {
        console.log('第2步');
        maxNo++;
        db.FindByCustom("update Seed set MaxNo=@maxNo where TableName='OPERATOR'", {
            'maxNo': maxNo
        }, function (seedResult, error) {
            next(error, maxNo, seedResult);
        });
    });

    // 3. 插入Operator表数据
    action.push(function (maxNo, seedResult, next) {
        console.log('第3步');
        var sql = "insert into Operator (OperatorID, StaffID, LoginName, Password, Grade) values " +
            "(@operatorId, @staffId, @loginName, @password, @grade)";
        var db = new dbMssql();
        db.FindByCustom(sql, {
                'operatorId': maxNo,
                'staffId': maxNo,
                'loginName': username,
                'password': md5(password),
                'grade': '护士'
            }, function (operatorResult, error) {
                next(error, maxNo, operatorResult);
            }
        )
    });

    // 执行方法组
    async.waterfall(action, function (error, maxNo, operatorResult) {
        if (error != undefined) {
            console.log(error.message);
            res.json('注册失败');
        } else {
            console.log('注册成功');
            res.json('注册成功');
        }
    });
});

/**
 * 获取敏感表结构(get)
 */
router.get('/getSensitives/:reportFormId', function (req, res) {
    var reportFormId = req.params.reportFormId;

    var sql = 'select * from Sensitive_Sensitive where ReportFormId=@reportFormId';
    var db = new dbMssql();
    db.FindByCustom(sql, {
            'reportFormId': reportFormId,
        }, function (r) {
            res.json(r);
        }
    )
});

/**
 * 获取上报表单数据(get)
 */
router.get('/getReportForms', function (req, res) {
    var db = new dbMssql();
    var sql = 'select * from Sensitive_ReportForm';
    db.Find(sql, function (r) {
        res.json(r);
    });
});

/**
 * 上传一天的表单内容(post方法)
 */
router.post('/postFormData', function (req, res) {
    // 取得上报科室id
    var officeId = req.body.officeId;
    // 取得操作员id
    var operatorId = req.body.operatorId;
    // 获取上报时间
    var date = req.body.date;
    // 取得上报数据
    var data = req.body.data;

    var db = new dbMssql();
    var action = [];
    // 1. 首先查询当天该科室是否有数据
    action.push(function (next) {
        console.log('第1步');
        var sql = 'select * from Sensitive_ReportOffice where OfficeId=@officeId and Date=@date';
        db.FindByCustom(sql, {
            'officeId': officeId,
            'date': date
        }, function (firstResult, error) {
            next(error, firstResult);
        });
    });

    // 2. 然后根据查询结果result.length是更新还是插入
    action.push(function (firstResult, next) {
        console.log('第2步');
        // 要执行的sql语句
        var sql;
        // 要有变化的ReportOffice主键id
        var id;
        if (firstResult.length > 0) {
            id = firstResult[0].ReportOfficeId;
            sql = "update Sensitive_ReportOffice set OperatorId=@operatorId";
            db.FindByCustom(sql, {
                'operatorId': operatorId
            }, function (result, error) {
                next(error, id);
            });
        } else {
            sql = 'insert into Sensitive_ReportOffice (OfficeId, OperatorId, Date) values ' +
                '(@officeId, @operatorId, @date)';
            db.FindByCustom(sql, {
                'officeId': officeId,
                'operatorId': operatorId,
                'date': date
            }, function (result, error) {
                next(error, result);
            });
        }
    });

    // 3. 取得将要有变化的ReportOffice主键id
    action.push(function (id, next) {
        if (id != undefined) {
            next(undefined, id);
        } else {
            var sql = 'select * from Sensitive_ReportOffice where OfficeId=@officeId and Date=@date';
            db.FindByCustom(sql, {
                'officeId': officeId,
                'date': date
            }, function (result, error) {
                next(error, result[0].ReportOfficeId);
            });
        }
    });

    // 4. 开始逐条插入数据
    var object = JSON.parse(data);
    for (var i = 0; i < object.length; i++) {
        // 敏感事件id
        var sensitiveId = object[i].sensitiveId;
        // 敏感事件人数
        var people = object[i].people;
        if (people == undefined) {
            people = 0;
        }
        // 4.1 首先查看是否存在这条记录

        function addActionCheck(sensitiveId) {
            var s = sensitiveId;
            action.push(function (id, next) {
                var sql = 'select * from Sensitive_ReportData where ReportOfficeId=@reportOfficeId and SensitiveId=@sensitiveId';
                db.FindByCustom(sql, {
                    'reportOfficeId': id,
                    'sensitiveId': s
                }, function (data, error) {
                    next(error, id, data);
                });
            });
        }

        addActionCheck(sensitiveId);

        // 4.2 如果存在就更新，不存在就插入
        function addActionUpdate(array) {
            var s = array[0];
            var p = array[1];
            action.push(function (id, data, next) {
                var sql;
                if (data.length > 0) {
                    sql = 'update Sensitive_ReportData set People=@p where ReportOfficeId=@id and SensitiveId=@s';
                } else {
                    sql = 'insert into Sensitive_ReportData (SensitiveId, ReportOfficeId, People) values (@s, @id, @p)';
                }
                db.FindByCustom(sql, {
                    'p': p,
                    'id': id,
                    's': s
                }, function (result, error) {
                    next(error, id);
                });
            });
        }

        addActionUpdate([sensitiveId, people]);

    }

    // 执行方法组
    async.waterfall(action, function (error, result) {
        if (error != undefined) {
            console.log(error.message);
            res.json('录入失败');
        } else {
            console.log('录入成功');
            res.json('录入成功');
        }
    });
});

/**
 * 获取一天的表单记录(get)
 */
router.get('/getFormData/:officeId/:date', function (req, res) {
    var officeId = req.params.officeId;
    var date = req.params.date;

    var db = new dbMssql();

    async.waterfall([function (next) {
        var sql = 'select * from Sensitive_ReportOffice where OfficeId=@officeId and Date=@date';
        db.FindByCustom(sql, {
                'officeId': officeId,
                'date': date
            }, function (result, error) {
                next(error, result);
            }
        )
    }, function (lastResult, next) {
        var reportOfficeId;
        if (lastResult.length == 0) {
            reportOfficeId = 0;
        } else {
            reportOfficeId = lastResult[0].ReportOfficeId;
        }
        var sql = 'select * from Sensitive_ReportData where ReportOfficeId=@reportOfficeId';
        db.FindByCustom(sql, {
                'reportOfficeId': reportOfficeId
            }, function (result, error) {
                next(error, result);
            }
        )
    }], function (err, result) {
        res.json(JSON.stringify(result));
    });

});

module.exports = router;