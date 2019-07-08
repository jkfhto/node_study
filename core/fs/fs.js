/**
 * fileSystem
 * 所有文件系统操作都具有同步和异步的形式。
 * 异步的形式总是将完成回调作为其最后一个参数。 传给完成回调的参数取决于具体方法，但第一个参数始终预留用于异常。 如果操作成功完成，则第一个参数将为 null 或 undefined。
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '1.txt')

let buf = Buffer.from('文件系统');
// console.log(buf.toString('utf8'));
// writeFile 默认写入的是utf8编码 并且如果文件不存在会创建这个文件,如果文件存在会清空文件中的内容
fs.writeFile(filePath, buf, { flag: 'a' }, (err) => {
    if (err) {
        console.error(err);
    }
})

//同步
fs.writeFileSync(filePath, buf, { flag: 'a' })


function copy(source, target, callback = () => { }) {

    // readFile 如果文件不存在直接报错 默认编码 buffer
    // 如果文件非常大readFile 淹没了我们的可用内存 可能导致内存溢出
    fs.readFile(source, (err, data) => {
        if (err) {
            console.error(err);
        } else {
            fs.writeFile(target, data, (err) => {
                callback(err);
            })
        }
    })
}

const fileOut = path.resolve(__dirname, '2.txt');

//拷贝文件
// fs.copyFile(filePath, fileOut, (err) => {
//     if (err) throw err;
//     console.log('源文件已拷贝到目标文件');
// });

copy(filePath, fileOut, (err) => {
    if (err) throw err;
    console.log('源文件已拷贝到目标文件');
});

