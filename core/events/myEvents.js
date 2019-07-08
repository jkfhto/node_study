function EventEmitter() {
    this._events = {};
}

//订阅事件
EventEmitter.prototype.on = function (eventName, callback) {
    if (!this._events) {
        this._events = {};
    }

    // 如果用户绑定的不是newListener 让newListener的回调函数执行
    if (eventName !== 'newListener') {
        if (this._events['newListener']) {
            this._events['newListener'].forEach(fn => fn(eventName))
        }
    }

    if (!this._events[eventName]) {
        this._events[eventName] = [callback];
    } else {
        this._events[eventName].push(callback);
    }
}

//发布事件
EventEmitter.prototype.emit = function (eventName, ...args) {
    if (this._events[eventName]) {
        this._events[eventName].forEach(fn => {
            fn.call(this, ...args);
        });
    }
}

//删除事件
EventEmitter.prototype.off = function (eventName, callback) {
    if (this._events[eventName]) {
        this._events[eventName] = this._events[eventName].filter(fn => {
            return fn != callback && fn.original !== callback
        });
    }
}

// 先绑定一个once函数，等待emit触发完后执行once函数 ，执行原有的逻辑，执行后删除once函数
EventEmitter.prototype.once = function (eventName, callback) {
    let once = (...args) => {
        callback.call(this, ...args);
        this.off(eventName, once);
    }
    once.original = callback; //绑定原始的回调函数 兼容off删除事件
    this.on(eventName, once);
}

module.exports = EventEmitter;