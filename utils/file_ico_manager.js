let fs = require('fs');
let join = require('path').join;

function getFileIcon(suffix) {
    
    if(suffix.length==0){
        return'/images/file_icon/icon_file/file.png';
    }
    let fPath = join(__dirname, '../static/images/file_icon/icon_file/', suffix + '.png');
    var exist =  fs.existsSync(fPath);
    if (exist) {
        return '/images/file_icon/icon_file/' + suffix + '.png';
    } else {
        return'/images/file_icon/icon_file/file.png';
    }


}
exports.GetFileIcon = getFileIcon;