const Koa = require('koa')
const views = require('koa-views')
const path = require('path')
var bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const static = require('koa-static')



const app = new Koa()

app.use(bodyParser());
// 将 public 目录设置为静态资源目录

app.use(static(path.join( __dirname,'./static')));

//加载模板引擎
app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))

var index=require('./routes/index');
var fm=require('./routes/api/file_manager');
app.use(index.routes(), index.allowedMethods())
app.use(fm.routes(), fm.allowedMethods())
app.listen(8200)