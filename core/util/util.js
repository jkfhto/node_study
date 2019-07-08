// util 工具方法

let util = require('util');

function Child() { }
function Parent() { }
// Child.prototype.__proto__ = Parent.prototype;
// Object.setPrototypeOf(Child.prototype,Parent.prototype);
// Child.prototype = Object.create(Parent.prototype)

util.inherits(Child, Parent); // 继承公有属性

/**
 * util.promisify
 * 让一个遵循异常优先的回调风格的函数， 即(err, value) => ...回调函数是最后一个参数, 返回一个返回值是一个 promise 版本的函数
 */

let fs = require('fs');
let path = require('path');

//promisify实现
function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            // 能实现promise化的原理就是借助了 node中的异步方法中的回调的参数第一个参数都是error
            fn(...args, function (err, data) {
                if (err) reject(err);
                resolve(data);
            })
        })
    }
}
let filePath = path.resolve(__dirname, '../README.md')

let read = promisify(fs.readFile);
read(filePath, 'utf8').then((data) => {
    console.log(data);
});

let readPromisify = util.promisify(fs.readFile);
readPromisify(filePath, 'utf8').then((data) => {
    console.log(data);
});

/**
 * util.isPrimitive
 * 如果给定对象是基本类型，则返回true。否则，返回false
 */
console.log(util.isPrimitive(new String('123')));
