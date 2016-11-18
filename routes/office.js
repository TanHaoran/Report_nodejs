var express = require('express');
var router = express.Router(); 
var db_mssql = require('../common/db_mssql.js');

/* GET home page. */
router.get('/:id', first,second);

function first(req, res, next){
	
	//根据id查找
	//如果存在
	next();
}

function second(req,res,next){
	//查询科室信息

}


module.exports = router;