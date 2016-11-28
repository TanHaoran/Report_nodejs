var httpServer = function () {
    var express = require('express');
    var path = require('path');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var favicon = require('serve-favicon');

    var config = require('./config.json');
    var port = config.http.httpPort;

    var app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.engine('.html', require('ejs').__express);
    app.set('view engine', 'html');

    // 设置图标
    app.use(favicon(__dirname + '/public/images/bitbug_favicon.ico'));

    app.use(logger('dev'));
    // body json 适配器
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(cookieParser());
    // 设置静态资源路径
    app.use(express.static(path.join(__dirname, 'public')));

    // 设置跨域访问
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
        res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By",' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
        else  next();
    });

    // 设置服务地址
    //app.use('/user', require('./routes/app'));
    //app.use('/office', require('./routes/office'))
    app.use('/', require('./routes/report'));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    app.listen(port, function () {
        console.log('http start service: ' + port);
    });
}

module.exports = new httpServer();