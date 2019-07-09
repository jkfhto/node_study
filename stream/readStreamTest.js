let fs = require("fs");
let path = require("path");

let filePath = path.resolve(__dirname, "1.txt");

/**
 * 创建可读流
 * path读取文件的路径
 * options
    flags打开文件要做的操作, 默认为 'r'
    encoding默认为null
    start开始读取的索引位置
    end结束读取的索引位置(包括结束位置)
    highWaterMark读取缓存区默认的大小64kb，每次读取的数据大小
    如果指定utf8编码highWaterMark要大于3个字节
 */
let readStream = fs.createReadStream(filePath, {
    flags: "r",
    encoding: null,
    autoClose: true,
    start: 0,
    // end:4, // 包前又包后
    highWaterMark: 3,
});

//监听open事件
readStream.on("open", () => {
    console.log("open回调");
});

let dataArr = [];

//监听data事件 流切换到流动模式,数据会被尽可能快的读出
readStream.on('data', (data) => {
    console.log(data);
    dataArr.push(data);
    readStream.pause(); //暂停触发data
})

let interval = setInterval(() => {
    readStream.resume(); //恢复触发data
}, 100)

//监听end事件 该事件会在读完数据后被触发
readStream.on('end', () => {
    let r = Buffer.concat(dataArr).toString();
    console.log(r);
    clearInterval(interval);
})

//监听error事件
readStream.on("error", (error) => {
    console.log("触发error：" + error);
});

//监听close事件
readStream.on("close", () => {
    console.log("close回调");
});
