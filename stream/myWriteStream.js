/**
 * 可写流的简单实现
 * 
 * fs.open(path, flags[, mode], callback)
 * path - 文件的路径。
 * flags - 文件打开的行为。
 * mode - 设置文件模式(权限)，文件创建默认权限为 0666(可读，可写)。
 * callback - 回调函数，带有两个参数如：callback(err, fd)。
 * 
 * fs.write(fd, buffer, offset, length, position, callback)
 * fd - 通过 fs.open() 方法返回的文件描述符。
 * buffer - 将 buffer 写入到 fd 指定的文件。
 * offset - 决定 buffer 中要被写入的部位。
 * length - 是一个整数，指定要写入的字节数。
 * position - 指定文件开头的偏移量（ 数据应该被写入的位置）。
 * callback - 回调函数， 有三个参数err, bytesWritten, buffer， err 为错误信息， bytesWritten 指定 buffer 中被写入的字节数， buffer 为缓冲区对象
 */

let fs = require('fs');
let EventEmitter = require('events');

class WriteStream extends EventEmitter {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'w';
        this.encoding = options.encoding || null;
        this.start = options.start || 0;
        this.end = options.end;
        this.fd = options.fd; //通过 fs.open() 方法返回的文件描述符
        this.autoClose = options.autoClose || true;
        this.highWaterMark = options.highWaterMark || 16 * 1024; //每次读取的字节数
        this.len = 0; // 维护写入的数据的字节数
        this.writing = false; // 如果往文件中写入需要把这个值改成true
        this.cache = []; //缓存队列 控制数据顺序写入
        this.position = this.start;
        this.needDrain = false; // 不触发drain事件
        if (!this.fd) {
            this.open(); //打开文件
        }
    }

    /**
     * chunk 要写入的内容
     * encoding 要写入的编码
     * callback 成功的毁掉
     */
    write(chunk, encoding, callback) {
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        this.len += chunk.length;
        let r = this.len < this.highWaterMark;
        //判断写入的内容是否达到了预期highWaterMark
        this.needDrain = !r; 
        if (this.writing) {
            //将数据插入缓存队列
            this.cache.push({
                chunk,
                encoding,
                callback
            })
        } else {
            this.writing = true;
            //直接写入文件中
            this._write(chunk, encoding, callback);
        }
        return r;
    }

    clearBuffer() {
        let obj = this.cache.shift();
        if (obj) {
            this._write(obj.chunk, obj.encoding, obj.callback)
        } else {
            //写入的内容达到了预期highWaterMark并且内存被整个写入了，就会触发drain事件
            if(this.needDrain){
                this.writing = false;
                this.emit('drain');
            }
        }
    }

    _write(chunk, encoding, callback = () => { }) {
        if (typeof this.fd != 'number') {
            // 发布订阅模式
            return this.once('open', () => this._write(chunk, encoding, callback));
        }
        fs.write(this.fd, chunk, 0, chunk.length, this.position, (err, written) => {
            this.position += written; // 偏移量增加
            this.len -= written; // 让缓存区减少
            callback(); // 表示当前写入成功了
            this.clearBuffer(); // 清空缓存
        });
    }

    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) {
                console.throw(err);
            }
            this.fd = fd;
            this.emit('open')
        })
    }
}

module.exports = WriteStream