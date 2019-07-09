/**
 * 可读流的简单实现
 * 
 * fs.open(path, flags[, mode], callback)
 * path - 文件的路径。
 * flags - 文件打开的行为。
 * mode - 设置文件模式(权限)，文件创建默认权限为 0666(可读，可写)。
 * callback - 回调函数，带有两个参数如：callback(err, fd)。
 * 
 * fs.read(fd, buffer, offset, length, position, callback)
 * fd - 通过 fs.open() 方法返回的文件描述符。
 * buffer - 数据写入的缓冲区。
 * offset - 缓冲区写入的偏移量。
 * length - 缓冲区写入的字节数。
 * position - 文件读取的起始位置，如果 position 的值为 null，则会从当前文件指针的位置读取。
 * callback - 回调函数， 有三个参数err, bytesRead, buffer， err 为错误信息， bytesRead 表示读取的字节数， buffer 为缓冲区对象
 */

let fs = require('fs');
let EventEmitter = require('events');

class ReadStream extends EventEmitter {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'r';
        this.encoding = options.encoding || null;
        this.start = options.start || 0;
        this.end = options.end;
        this.fd = options.fd; //通过 fs.open() 方法返回的文件描述符
        this.autoClose = options.autoClose || true;
        this.highWaterMark = options.highWaterMark || 64 * 1024; //每次读取的字节数
        this.flowing = null; // 默认是非流动模式
        this.finish = false;
        this.position = this.start; // 读取的偏移量

        if (!this.fd) {
            this.open();//打开文件
        }

        //监听data事件 触发数据读取
        this.on('newListener', (type) => {
            if (type === 'data') {
                this.flowing = true; //流切换到流动模式
                this.read(); //读取数据
            }
        })
    }

    pause() {
        this.flowing = false; // 控制读取是否暂停
    }

    resume() {
        if (this.finish) {
            return;
        }
        this.flowing = true; // 控制读取是否暂停
        this.read();//重新读取数据
    }

    pipe(ws) {
        this.on('data', (data) => {
            let flag = ws.write(data);
            if (!flag) {
                this.pause();
            }
        })

        ws.on('drain', () => {
            this.resume();
        })
    }

    //处理数据读取 需要先打开文件获取fd再读取数据
    read() {
        if (typeof this.fd != 'number') {
            // 发布订阅模式
            return this.once('open', () => this.read());
        }
        // 每次读取后 我都需要将这个buffer发射出去,而且都是产生一个新的内存，不能复用，如果复用那最后的结果会只剩下最后一次的读取结构
        // 如果当前数据长度 小于highWaterMark 读取少的
        let howMuchToRead = this.end ? Math.min(this.end - this.position + 1, this.highWaterMark) : this.highWaterMark;
        let buffer = Buffer.alloc(howMuchToRead);
        console.log("howMuchToRead：" + howMuchToRead, "position：" + this.position);
        fs.read(this.fd, buffer, 0, howMuchToRead, this.position, (err, bytesRead) => {
            if (err) {
                console.error(err);
                return;
            }
            this.position += bytesRead; //更新文件读取的起始位置
            //如果最后一次读取的个数小于highWaterMark，使用slice截取正确数据
            this.emit('data', buffer.slice(0, bytesRead));
            // 如果读取的数据长度和hightWater相等 再去读取一次
            if (bytesRead == this.highWaterMark) {
                // 如果是流动模式继续读取 否则暂停
                if (this.flowing) {
                    this.read();
                }
            } else {
                //数据读取完 发布end事件
                this.emit('end');
                this.finish = true;
                if (this.autoClose) {
                    fs.close(this.fd, () => {
                        this.emit('close');
                    })
                }
            }
        })
    }

    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) {
                console.error(err);
            }
            this.fd = fd;
            this.emit('open')
        })
    }
}

module.exports = ReadStream