const fs = require('fs');
const path = require('path');
/**
 * fs.mkdir(path[, mode], callback)：创建目录，要求父目录必须存在
 */

/**
 * fs.access(path[, mode], callback)：测试用户对 path 指定的文件或目录的权限
 * mode：参数是一个可选的整数，指定要执行的可访问性检查
 * callback：是一个回调函数，调用时将传入可能的错误参数。 如果可访问性检查失败，则错误参数将是 Error 对象
 */

// const dir = 'a'
// fs.mkdir(dir, (err) => {
//     if (err){
//         console.log("创建目录失败：" + err)
//     }else{
//        console.log("创建目录成功")
//     } 
// })

//异步创建目录
function mkdir(dir, callback = () => { }) {
    const arr = dir.split('/');
    let index = 0;
    function next() {
        if (arr.length === index) return callback();
        let currentPath = arr.slice(0, ++index).join('/');
        currentPath = path.resolve(__dirname, currentPath);
        fs.access(currentPath, (err) => {
            if (err) {
                // 目录不存在，创建目录
                fs.mkdir(currentPath, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        next();
                    }
                })
            } else {
                // 目录已经存在，继续创建下一层目录
                next();
            }
        })
    }
    next();
}
const dir = 'a/b/c/d';
mkdir(dir, () => { console.log("创建目录成功") })