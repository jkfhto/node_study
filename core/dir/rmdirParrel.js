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

//异步删除目录 并行 两个一起遍历 paralle (深度优先)
function rmdir(dir, callback = () => { }) {
    // 判断当前路径状态
    fs.stat(dir, (err, stats) => {
        if (err) {
            console.error(err)
        } else {
            //目录对应文件 直接删除
            if (stats.isFile()) {
                fs.unlink(dir, (err) => {
                    if (err) {
                        onsole.log("删除文件失败：" + err);
                    } else {
                        console.log("删除文件成功：" + dir);
                        callback();
                    }
                })
            } else {
                // 只能读取子目录，并且没有父路径
                fs.readdir(dir, (err, files) => {
                    if (err) {
                        console.log(err)
                    } else {
                        let index = 0;
                        let length = files.length;
                        //子目录全部删除 则删除父目录
                        function done(){
                            index++;
                            if (index === length) {
                                console.log('删除目录成功：' + dir);
                                fs.rmdir(dir, callback)
                            }
                        }
                        if(length === 0){ // 如果目录中没有内容 直接删除即可
                            console.log('删除目录成功：' + dir);
                            fs.rmdir(dir,callback);
                        }
                        // 每次子目录删除成功后都会调用done ，如果子目录都删除后后，删除父目录
                        files = files.map((value) => {
                            rmdir(path.join(dir, value), done)
                        })
                    }
                })
            }
        }
    });
}

const dir = path.resolve(__dirname, 'a');
rmdir(dir, () => { console.log("删除目录成功..") });