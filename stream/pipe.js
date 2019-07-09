const fs = require('fs');
const path = require('path');

const readPath = path.resolve(__dirname, '1.txt');
const writePath = path.resolve(__dirname, '1c1.txt');

/**
 * 将数据的滞留量限制到一个可接受的水平，以使得不同速度的来源和目标不会淹没可用内存
 * 默认readStream的highWaterMark为64kb， writeStream的highWaterMark为16kb，
 */
const readStream = fs.createReadStream(readPath, {
    highWaterMark: 4 //64kb
});
const writeStream = fs.createWriteStream(writePath, {
    highWaterMark: 1 //16kb
});

readStream.pipe(writeStream);