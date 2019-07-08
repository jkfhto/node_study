const EventEmitter = require('events'); //基于发布订阅模式
const util = require('util');

//  on emit once off(remveListener) newListener
function test(){

}
util.inherits(test, EventEmitter);

const _test = new test();

const fn = function (parameter) {
    console.log('触发event：' + parameter);
}

// 我想实现如果用户绑定了一个event事件 我就直接触发这个事件
_test.on('newListener', function (type) {
    console.log("触发newListener：" + type);
    // if(type === 'event'){
    //     //微任务 等同步任务执行完再触发
    //     process.nextTick(()=>{
    //         _test.emit('event', 'newListener');
    //     })
    // }
})

_test.on('event', fn);
_test.on('event', fn);
// _test.once('event', fn);
// _test.off('event', fn);
_test.emit('event', '123'); // 在emit之后会把once绑定事件移除掉
// _test.emit('event', '456');