/*
多实例结构
*/
var db_mssql  = function()
{
	var mssql = require('mssql');
	var config = require('../config.json');
	var dbconf= config.db;


/*
	var connection = new sql.Connection(config, function(err) {
	    var request = new sql.Request(connection); // or: var request = connection.request();
	    request.query('select * from office', function(err, recordset) {
	        console.dir(recordset);
	    });

	    // Stored Procedure

	    var request = new sql.Request(connection);
	    request.input('input_parameter', sql.Int, 10);
	    request.output('output_parameter', sql.VarChar(50));
	    request.execute('procedure_name', function(err, recordsets, returnValue) {
	        // ... error checks

	        console.dir(recordsets);
	    });
	});

	connection.on('error', function(err) {
	    // ... error handler
	});

*/
	this.Find = function(sql,callback,errorAction){
		var connection = new mssql.Connection(dbconf, function(err) {
			var request = new mssql.Request(connection); // or: var request = connection.request();
			request.query(sql, function(err, recordset) {
				if(err){
					console.log(err.message);
					if(errorAction != undefined){
						errorAction(err);
					}
				}
				else{
					if(callback != undefined)
			    		callback(recordset); 
				}
			});
			connection.close();
		});
	};

	this.FindByCustom = function (sql,paramsObj,callback){
		if(!(paramsObj instanceof Object)){
			throw '参数设置有错误';
		}

		var connection = new mssql.Connection(dbconf, function(err) {
			if(err != undefined){
				connection.close();
				console.log(err.message);
				return;
			}

			var request = new mssql.Request(connection); 

			for(var key in paramsObj){
				AddInput(request,key,paramsObj[key]);
			}
			 
			request.query(sql, function(err, recordset) {
				if(err){
					console.log(err.message);
				}
				else{
			    	callback(recordset); 
				}
			});
			connection.close();
		});
	}


	function AddInput(request,key,value){
		var vtype ;

		switch (typeof(value)){
			case 'string':
				vtype =  mssql.VarChar;
				break;
			case 'number':
				if(parseInt(value)==value){
					vtype =  mssql.Int;
				}else{
					vtype =  mssql.Decimal(18,2);
				}

				break;
			case 'boolean':
				vtype =  mssql.Bit;
				break;
			case 'object':
				if(value instanceof Date)
					vtype =  mssql.DateTime;
				break;
			case 'buffer':
				vtype =  mssql.VarBinary;
				break;
		}
		request.input(key, vtype, value);
	}
};

module.exports = db_mssql;