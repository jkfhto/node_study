const fs = require('fs');
const path = require('path');

const BUFFER_SIZE = 10;
// let buffer = Buffer.alloc(BUFFER_SIZE);

/**
 * fs.open(path, flags[, mode], callback): 异步打开文件, 返回文件描述符fd
 * path - 文件的路径。
 * flags - 文件打开的行为。 具体值详见下文。
 * mode - 设置文件模式(权限)， 文件创建默认权限为 0666(可读， 可写)。
 * callback - 回调函数， 带有两个参数如： callback(err, fd)。
 */

/**
 * fs.read(fd, buffer, offset, length, position, callback): 通过文件描述符 fd 读取文件内容
 * fd - 通过 fs.open() 方法返回的文件描述符。
 * buffer - 数据写入的缓冲区。
 * offset - 缓冲区写入的写入偏移量。
 * length - 缓冲区写入的字节数。
 * position - 文件读取的起始位置，如果 position 的值为 null，则会从当前文件指针的位置读取。
 * callback - 回调函数，有三个参数err, bytesRead, buffer，err 为错误信息， bytesRead 表示读取的字节数，buffer 为缓冲区对象。
 */

/**
* fs.write(fd, buffer, offset, length[, position], callback): 将 buffer 写入到 fd 指定的文件
* fd - 通过 fs.open() 方法返回的文件描述符。
* buffer - 将 buffer 写入到 fd 指定的文件。
* offset - 决定 buffer 中要被写入的部位。
* length - 是一个整数，指定要写入的字节数。
* position - 指定文件开头的偏移量（ 数据应该被写入的位置）。
* callback - 回调函数， 有三个参数err, bytesWritten, buffer， err 为错误信息， bytesWritten 指定 buffer 中被写入的字节数， buffer 为缓冲区对象
*/

/**
 * fs.write(fd, string[, position[, encoding]], callback): 将 string 写入到 fd 指定的文件。 如果 string 不是一个字符串， 则该值会被强制转换为字符串。
 * position 指定文件开头的偏移量（ 数据应该被写入的位置）。 如果 typeof position !== 'number'，则数据会被写入当前的位置。
 * encoding 是期望的字符串编码。
 * callback回调会接收到参数(err, written, string)， 其中 written 指定传入的字符串中被要求写入的字节数。 被写入的字节数不一定与被写入的字符串字符数相同
 */

const readPath = path.resolve(__dirname, '1.txt');
const writePath = path.resolve(__dirname, '2.txt');
fs.open(readPath, 'r', (err, rfd) => {
    if (err) {
        console.error(err)
    } else {
         console.log("打开文件fd：" + rfd)
        fs.open(writePath, 'w', (err, wfd) => {
            if (err) {
                console.error(err);
            } else {
                console.log("打开文件fd：" + wfd)
                let readPosition = 0;
                function next() {
                    let buffer = Buffer.alloc(BUFFER_SIZE);
                    fs.read(rfd, buffer, 0, BUFFER_SIZE, readPosition, (err, bytesRead) => {
                        if (err) {
                            console.error(err);
                        } else {
                            readPosition += bytesRead;
                            //如果调用fs.write(fd, buffer, offset, length[, position], callback) 将buffer写入到fd指定的文件会出现乱码的情况
                            //此处调用fs.write(fd, string[, position[, encoding]], callback) 将string写入到fd指定的文件不会出现乱码
                            if (bytesRead != 0) {
                                //递归
                                fs.write(wfd, buffer, 0, bytesRead, (err, bytesWritten, buffer) => {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        next();
                                    }
                                })
                            } else {
                                //关闭文件
                                fs.close(rfd, () => {
                                    console.log("关闭文件fd：" + rfd)
                                });
                                fs.close(wfd, () => {
                                    console.log("关闭文件fd：" + wfd)
                                });
                            }

                        }
                    })
                }
                next()
            }
        })
    }
})