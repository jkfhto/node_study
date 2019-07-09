const fs = require("fs").promises;
const path = require("path");

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
async function rmdir(dir) {
    const stats = await fs.stat(dir);
    if (stats.isFile()){
        return await fs.unlink(dir);
    }else{
        const dirs = await fs.readdir(dir);
        console.log(dirs);
        await Promise.all(dirs.map(value => rmdir(path.join(dir, value))));
        // 当删除所有儿子后删除自己
        return await fs.rmdir(dir);
    }
}
const dir = path.resolve(__dirname, "a");
rmdir(dir).then(() => {
    console.log("删除目录成功：");
}, (err) => {
    console.log("err："+err);
})