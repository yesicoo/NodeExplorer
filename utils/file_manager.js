

let fs = require('fs');
let join = require('path').join;
let icon = require('./file_ico_manager');
let fo = require('./file_open');

function readDirs(path) {
    let result = [];
    let files = fs.readdirSync(path);
    files.forEach((val, index) => {
        let fPath = join(path, val);
        let stats = fs.statSync(fPath);
        if (stats.isDirectory()) {
            if (val.indexOf('.') != 0) {
                result.push(val);
            }
        }
    });
    return result;
}

function readFiles(path) {
    let result = [];
    let files = fs.readdirSync(path);
    files.forEach((val, index) => {
        let fPath = join(path, val);
        let stats = fs.statSync(fPath);
        if (stats.isFile()) {
            if (val.indexOf('.') != 0) {
                result.push(val);
            }
        }
    });
    return result;
}

function readDirfiles(path) {
    let result = {};
    result.Dirs = [];
    result.Files = [];
    result.Error="";
    try {
        let files = fs.readdirSync(path);
    files.forEach((val, index) => {
        let fPath = join(path, val);
        let stats = fs.statSync(fPath);
        if (val.indexOf('.') != 0) {
            var suffix = val.substr(val.lastIndexOf('.')+1);
            if (stats.isFile() || suffix=="app") {
                var obj = new Object();
                obj.size = stats.size; //文件大小，以字节为单位
                obj.name = val; //文件名
                obj.path = join(path,val); //文件绝对路径
                obj.atime = stats.atime.toLocaleString();
                obj.birthtime = stats.birthtime.toLocaleString();
                obj.mtime = stats.mtime.toLocaleString();
                obj.icon=icon.GetFileIcon(suffix);
                obj.suffix = suffix;
                obj.urlpath =join(path,val);
                obj.description = "文件类型：*."+suffix+"文件<br>"
                obj.description +="文件名称："+val+"<br>"
                obj.description +="文件大小："+bytesToSize(stats.size)+"<br>"
                obj.description +="文件位置："+obj.path+"<br>"
                obj.description +="创建时间："+obj.birthtime+"<br>"
                obj.description +="修改时间："+obj.mtime+"<br>"
                obj.description +="访问时间："+obj.atime+"<br>"
          
                result.Files.push(obj);
            } else if (stats.isDirectory()) {
                var obj = new Object();
                obj.name = val;
                obj.path = join(path,val);
                obj.atime = stats.atime.toLocaleString();
                obj.birthtime = stats.birthtime.toLocaleString();
                obj.mtime = stats.mtime.toLocaleString();
                obj.description = "类型："+val+" 文件夹<br>"
                obj.description +="位置："+obj.path+"<br>"
                obj.description +="创建时间："+obj.birthtime+"<br>"
                obj.description +="修改时间："+obj.mtime+"<br>"
                obj.description +="访问时间："+obj.atime+"<br>"
                result.Dirs.push(obj);
            }
        }
    });
    } catch (e) {
        result.Error=e.message;
    }
    return result;
}

function readImg2Base64(path){

    // if(os.type() =="Darwin" && path.substr(path.lastIndexOf('.')+1)=="app"){
    //     path=join(path,"Contents","Resources","app.icns");
    // }
    var exist =  fs.existsSync(path);
    if(exist){
        var bData = fs.readFileSync(path);
        var base64Str = bData.toString('base64');
        var datauri = 'data:image/png;base64,' + base64Str;
        return datauri;
    }else{
        return "";
    }
}

function openFile(path){
    fo.OpenFile(path);
}
function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1000, // or 1024
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
 
   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

exports.ReadDirs = readDirs;
exports.ReadFiles = readFiles;
exports.ReadDirfiles = readDirfiles;
exports.ReadBase64Img = readImg2Base64;
exports.OpenFile = openFile;