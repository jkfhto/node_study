let fs = require('fs');
let path = require('path');

let filePath = path.resolve(__dirname, 'output.txt');
/**
 * path写入的文件路径
 * options
 * flags打开文件要做的操作,默认为'w'
 * encoding默认为utf8
 * highWaterMark写入缓存区的默认大小16kb，每次写入的数据大小
 */
let writeStream = fs.createWriteStream(filePath,{
    flags:'w',
    encoding:'utf8',
    mode:0o666,
    autoClose:true,
    start:0,
    highWaterMark: 4, // 默认写入预期大小是 16k
})
let flag;

/**
 * chunk写入的数据buffer/string
 * encoding编码格式chunk为字符串时有用，可选
 * callback 写入成功后的回调
 * 返回值为布尔值，系统缓存区满时为false,未满时为true
 */
// 写入10个数
let i = 0;

function write() {
    let flag = true; // 默认表示可以写入
    while (i < 9 && flag) { // 10个字节
        flag = writeStream.write(i++ + ''); // string or Buffer
        console.log(flag);
    }
}
writeStream.on('drain', () => { // 如果我写入的内容达到了预期highWaterMark并且内存被整个写入了，就会触发drain事件
    console.log('drain');
    write();
})
write(); // 开始写入