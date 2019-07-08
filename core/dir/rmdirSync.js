const fs = require('fs');
const path = require('path');

/**
 * fs.rmdir(path, callback)：异步删除目录
 * path：文件路径。
 * callback：回调函数。
 */

/**
 * fs.unlink(path, callback)：异步删除文件
 * path：文件路径。
 * callback：回调函数。
 */

/**
* fs.access(path[, mode], callback)：测试用户对 path 指定的文件或目录的权限
* mode：参数是一个可选的整数，指定要执行的可访问性检查
* callback：是一个回调函数，调用时将传入可能的错误参数。 如果可访问性检查失败，则错误参数将是 Error 对象
*/

/**
 * fs.readdir(path, callback)：读取目录下所有的孩子文件
 * path：文件路径。
 * callback：回调函数，回调函数带有两个参数err, files，err 为错误信息，files 为 目录下的文件数组列表
 */

//同步删除目录(深度优先)
function rmdirSync(dir){
    try {
        // 判断当前路径状态
        const stat = fs.statSync(dir);
        //目录对应文件 直接删除
        if (stat.isFile()) {
            fs.unlinkSync(dir)
            console.log("删除文件成功：" + dir);
        } else {
            // 只能读取子目录，并且没有父路径
            let filesArr = fs.readdirSync(dir);
            // 递归删除子目录
            filesArr.forEach((value) => {
                rmdirSync(path.join(dir, value))
            })
            // 最后删除父目录
            fs.rmdirSync(dir);
            console.log("删除目录成功：" + dir)
        }
    } catch (e) {
        console.error("删除目录失败：" + e);
    }
}

const dir = path.resolve(__dirname,'a');
rmdirSync(dir);