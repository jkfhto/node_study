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

//同步创建目录
function mkdir(dir) {
    let arr = dir.split('/');
    for (var i = 0, j = arr.length; i < j; i++) {
        let currentPath = arr.slice(0, i + 1).join('/');
        currentPath = path.resolve(__dirname, currentPath)
        try {
            fs.accessSync(currentPath)
        } catch (e) {
            fs.mkdirSync(currentPath);
        }
    }
}
const dir = 'a/b/c/d';
mkdir(dir)