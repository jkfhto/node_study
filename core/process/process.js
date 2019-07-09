/**
 * process：代表node.js应用程序，可以获取应用程序的用户，运行环境等各种信息
 * process.argv 属性返回一个数组，这个数组包含了启动Node.js进程时的命令行参数。第一个元素为process.execPath，返回启动Node.js进程的可执行文件所在的绝对路径。如果需要获取argv[0]的值请参见 process.argv0。第二个元素为当前执行的JavaScript文件路径。剩余的元素为其他命令行参数
 * process cwd() 方法返回 Node.js 进程当前工作的目录
 * process.pid：进程的id号
 * process.env 属性返回包含用户环境的对象
 */

/**
 * tj commander：可以处理命令行传递的参数的 可以帮我们快速实现命令行工具的功能
 * https://github.com/tj/commander.js
 */

process.argv.forEach(function (item) {
    console.log(item);
});

let args = process.argv.slice(2);

// 处理用户的参数 webpack --config d: --port 80 => {config:'d:',port:80}
let r = args.reduce((a,b,index,arr)=>{
    if(b.startsWith('--')){
        a[b.slice(2)]  = arr[index+1];
    }
    return a
},{});
console.log(r);

process.on('exit', function () {
    console.log('clear');
});

console.log(`Current directory: ${process.cwd()}`);
//当前模块的目录名
console.log("__dirname：" + __dirname);

console.log("pid：" + process.pid); // 进程的id号 
console.log("env：" + process.env);

//nextTick vm.$nextTick 微任务
//nextTick比promise先执行

Promise.resolve().then(()=>{
    console.log('p');
})
process.nextTick(()=>{
    console.log('n');
});

/**
 * process.nextTick & setImmediate & setTimeout
 * process.nextTick()方法将 callback 添加到"next tick 队列"。 一旦当前事件轮询队列的任务全部完成，在next tick队列中的所有callbacks会被依次调用。
 * setImmediate预定立即执行的 callback，它是在 I/O 事件的回调之后被触发
 * setImmediate & setTimeout执行顺序不固定
 */
setTimeout(function () {
    console.log('4');
});
setImmediate(function () {
    console.log('5');
});
process.nextTick(function () {
    console.log('1');
    process.nextTick(function () {
        console.log('2');
        process.nextTick(function () {
            console.log('3');
        });
    });
});

console.log('next');