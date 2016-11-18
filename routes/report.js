var express = require('express');
var router = express.Router();
var dbMssql = require('../common/db_mssql.js');


// router.get('/', function (req, res, next) {
//     res.render('app', {
//         title: 'demo',
//         url: 'ss'
//     });
// });

/**
 * 用户登陆
 */
router.get('/login', function (req, res) {


})

/**
 * 获取所有的科室
 */
router.get('/getOffice', function (req, res) {
    var db = new dbMssql();
    var sql = 'select * from office';
    db.Find(sql, function (r) {
        res.json(r);
    });
})

router.get('/', function (req, res) {
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