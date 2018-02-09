const fs = require('fs');
const router = require('koa-router')()
const si = require('systeminformation');
const fm = require('../utils/file_manager')
router.get('/', async (ctx, next) => {
    let diskLayout = JSON.stringify( await si.diskLayout());
    //let filesize = JSON.stringify(await si.baseboard());
   // let paths = fm.ReadDirs('/');

    await ctx.render('main', {
        diskLayout,
    })
});

module.exports = router