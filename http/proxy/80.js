let http = require('http');
let httpProxy = require('http-proxy'); // 做代理使用的
var proxy = httpProxy.createProxyServer();
let map = {
    'a.zhufeng.cn:81': 'http://localhost:3000',
    'b.zhufeng.cn:81': 'http://localhost:4000'
}
// proxy 一般情况下应用的都是反向代理
http.createServer((req, res) => {
    let host = req.headers.host;
    console.log(map[host], host)
    proxy.web(req, res, {
        target: map[host]
    });
}).listen(81);