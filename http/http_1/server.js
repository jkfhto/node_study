const http = require('http');
const url = require('url');
const querystring = require('querystring');

/**
 * HTTP
 */
const PORT = 3000;
const server = http.createServer((req, res) => {
    // req是一个可读流 读取可读流内容 on('data') on('end')
    //请求行
    console.log(req.method);//请求方法
    const { pathname, query } = url.parse(req.url, true)
    console.log("pathname：" + pathname, "query：" + JSON.stringify(query));//路径 参数
    console.log(req.httpVersion, req.httpVersionMajor, req.httpVersionMinor);//http版本，大版本，小版本

    //请求头
    console.log(`headers：${JSON.stringify(req.headers)}`);//所有的key都是小写的

    // 请求体
    let arr = [];
    req.on('data', function (chunk) { // 没有数据不会触发data
        arr.push(chunk)
    })
    req.on('end', function (chunk) { // 没有请求体会触发end
        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {//处理表格
            let str = Buffer.concat(arr).toString(); // a=1&b=2  => {a:1,b:2}
            let obj = querystring.parse(str);
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.end(JSON.stringify(obj)); // 前后端通信 都是json
        } else if (req.headers['content-type'] == 'application/json') {//处理json
            let str = Buffer.concat(arr).toString();
            let obj = JSON.parse(str);
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.end(JSON.stringify(obj)); // 前后端通信 都是json
        } else if (req.headers['content-type'].includes('text/plain')) {//处理纯文本
            res.setHeader('Content-Type', 'text/plain;charset=utf-8');
            res.end(Buffer.concat(arr));
        }
    })
    // -----------------请求--------------------

    //res是一个可写流 write end
    // 响应行 状态码 
    res.statusCode = 200;
    // res.statusCode = 204;//没有响应体

    //响应头
    res.setHeader('Content-Type', 'text/html;charset=utf-8');

    //响应体
    res.write('node中文');//write 需要在end之前 

    res.end();// 每次调用end 方法传递参数都会调用write方法

});


//  服务启动后会执行此函数
// backlog：多个请求访问我如果超过了最大限制 就不在接收了
server.listen(PORT, () => {
    console.log(`server start ${PORT}`);
})

// 如果多次启动同一个端口号   自动+1
server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        server.listen(++PORT);
    }
});
