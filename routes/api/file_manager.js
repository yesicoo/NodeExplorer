const fs = require('fs');
const router = require('koa-router')();
const fm = require('../../utils/file_manager')

router.post('/api/fm/files', async (ctx, next) => {
    var data = ctx.request.body;
    ctx.body = fm.readFiles(data.path);
})

router.post('/api/fm/dirs', async (ctx, next) => {
    var data = ctx.request.body;
    ctx.body = fm.ReadDirs(data.path);
})
router.post('/api/fm/dirfiles', async (ctx, next) => {
    var data = ctx.request.body;
    ctx.body = fm.ReadDirfiles(data.path);
})

router.post('/api/fm/base64img', async (ctx, next) => {
    var data = ctx.request.body;
    ctx.body = fm.ReadBase64Img(data.path);
})
router.post('/api/fm/open', async (ctx, next) => {
    var data = ctx.request.body;
   fm.OpenFile(data.path);
   ctx.body = "over";
})
module.exports = router