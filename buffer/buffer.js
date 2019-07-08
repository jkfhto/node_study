/**
 * 如何实现二进制和任何进行的转化
 * 20 
 * 0b11
 * 0x11
 */
//把任意进制转成十进制
console.log(parseInt('20', 10));//20
console.log(parseInt('11', 2));//3
console.log(parseInt('20', 16));//32
//把十进制转成任意进制
console.log((3).toString(2));//11
console.log(3..toString(2));//11
console.log((77).toString(8));//115 5+ 8+64
console.log((77).toString(16));//4d 64+13
console.log((17).toString(8));//21
//定义buffer三种方式
let buf1 = Buffer.alloc(6);
console.log(buf1);
let buf2 = Buffer.allocUnsafe(6);
console.log(buf2);


let buf3 = Buffer.from('珠峰');
console.log(buf3);
console.log((65).toString(16));//41
let buf4 = Buffer.from([65, 66, 67]);
console.log(buf4);
console.log(buf4.toString());
//常用方法 fill 
let buf5 = Buffer.allocUnsafe(300);
console.log(buf5);
buf5.fill(0);
console.log(buf5);
//write 向buffer中写入数据

let buf6 = Buffer.alloc(6);
buf6.write('珠', 0, 3, 'utf8');// 1 2 3 
buf6.write('峰', 3, 3, 'utf8');// 1 2 3 4 5 6 
console.log(buf6, buf6.toString());

//writeInt8 
let buf7 = Buffer.alloc(4);
buf7.writeInt8(0, 0);
buf7.writeInt8(16, 1);
buf7.writeInt8(32, 2);
buf7.writeInt8(64, 3);
console.log(buf7); // <Buffer 00 10 20 30>
console.log(buf7.readInt8(0)); //0
console.log(buf7.readInt8(1)); //16
console.log(buf7.readInt8(2)); //32
console.log(buf7.readInt8(3)); //48

let buf8 = Buffer.alloc(4);
buf8.writeInt16BE(2 ** 8, 0);//Math.pow(2,8);256
console.log(buf8);
console.log(buf8.readInt16BE(0));

buf8.writeInt16LE(2 ** 8, 2);
console.log(buf8);
console.log(buf8.readInt16LE(2));

//toString
let buf9 = Buffer.from('珠峰架构');
console.log(buf9.toString('utf8', 3, 9));

let buf10 = Buffer.from('珠峰架构');
console.log(buf10.slice(3, 6).toString());

//截取的乱码问题
let buf11 = Buffer.from('珠峰架构');
//console.log(buf11.slice(3,7).toString());
//console.log(buf11.slice(7).toString());
let { StringDecoder } = require('string_decoder');
let sd = new StringDecoder();
console.log(sd.write(buf11.slice(3, 7)));
console.log(sd.write(buf11.slice(7)));

//concat合并
//copy拷贝
let fromBuffer = Buffer.from('珠峰架构');
let toBuffer = Buffer.alloc(6);
Buffer.prototype.copy = function (targetBuffer, targetStart, sourceStart, sourceEnd) {
  for (let i = sourceStart; i < sourceEnd; i++) {
    targetBuffer[targetStart++] = this[i];
  }
}
fromBuffer.copy(toBuffer, 0, 3, 9);
console.log(toBuffer.toString());


let buf111 = Buffer.from('珠峰');
let buf222 = Buffer.from('架构');
Buffer.concat = function (list) {
  let length = list.reduce((total, item) => {
    total += item.length;
    return total;
  }, 0);
  let result = Buffer.alloc(length);
  let pos = 0;
  for (let buffer of list) {
    for (let byte of buffer) {
      result[pos++] = byte;
    }
  }
  return result;
}
let buffer = Buffer.concat([buf111, buf222]);

console.log(buffer.toString());


console.log(Buffer.isBuffer(''));
console.log(Buffer.isBuffer(buffer));

let str = '珠峰';
console.log(str.length);
console.log(Buffer.byteLength(str));


/**
 * Base64
 * Base64是网络上最常见的用于传输8Bit字节码的编码方式之一
 * Base64就是一种基于64个可打印字符来表示二进制数据的方法
 * Base64要求把每三个8Bit的字节转换为四个6Bit的字节（ 38 = 46 = 24）， 然后把6Bit再添两位高位0， 组成四个8Bit的字节
 */
const CHARTS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function transfer(str) {
  let buf = Buffer.from(str);//字符串转buffer 3=>3个字节=>24位
  let result = '';
  for (let b of buf) {
    result += b.toString(2);
  }// 24位的 010101 010101 001010 101001
  return result.match(/(\d{6})/g).map(val => parseInt(val, 2)).map(val => CHARTS[val]).join('');
}
let r = transfer('a');
console.log(r);//54+g
