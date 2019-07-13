const http = require('http');
const fs = require('fs').promises;
const createReadStream = require('fs').createReadStream;
const url = require('url');
const path = require('path');
const mime = require('mime');//根据文件路径 返回正确的Content-Type

const PORT = 3000;
/**
 * 静态服务：根据不同的路径返回不同的资源
 */

class Server {
    //处理http请求
    async handleRequest(req, res) {
        const { pathname } = url.parse(req.url);
        let absPath = path.join(__dirname, pathname);//绝对路径

        //处理跨域
        this.handleCrossOrigin(req, res);

        // 在静态文件之前处理 动态的接口
        this.handleRouter(pathname, req, res);

        try {
            const stats = await fs.stat(absPath);
            //处理目录
            if (stats.isDirectory()) {
                absPath = path.join(absPath, 'index.html');
                await fs.access(absPath);//判断文件是否存在
            }
            //处理文件
            this.handleFile(absPath, req, res);
        } catch (e) {
            //文件不存在 处理错误
            this.handleError(e, req, res);
        }
    }

    //处理跨域
    handleCrossOrigin(req, res) {
        //跨域才需要进行相关配置
        if (req.headers.origin) {
            res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
            // 允许方法有哪些
            //  简单请求  get post 如果增加了自定义头变为复杂的请求 复杂请求会先发送OPTIONS请求
            res.setHeader(
                "Access-Control-Allow-Methods",
                "GET,POST,PUT,DELETE,OPTIONS"
            );
            //允许自定义头
            res.setHeader("Access-Control-Allow-Headers", "name");

            res.setHeader("Access-Control-Allow-Credentials", true);//允许携带cookie 客户端也需要进行相关设置才能生效（withCredentials）
            // http 无状态的  跨域是不支持cookie传递的
            res.setHeader("Set-Cookie", "name=hello"); // 后端设置一个cookie
            console.log(req.headers)

            // 30秒内不要在发options
            res.setHeader("Access-Control-Max-Age", 30);

            //处理OPTIONS
            if (req.method === "OPTIONS") {
                return res.end();
            }
        }
    }

    //处理error
    handleError(e, req, res) {
        res.statusCode = 404;
        res.end("Not Found");
    }

    //处理路由
    handleRouter(pathname, req, res) {
        if (pathname === '/user' && req.method === 'GET') {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ name: "node" }));
        }
        if (pathname === '/user' && req.method === 'DELETE') {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ name: "node" }));
        }
    }

    //处理文件
    handleFile(filePath, req, res) {
        res.setHeader('Content-Type', mime.getType(filePath) + ';charset=utf-8');
        createReadStream(filePath).pipe(res);
    }

    //开启服务
    start() {
        const server = http.createServer(this.handleRequest.bind(this));
        server.listen(...arguments);
    }
}

const server = new Server();
server.start(PORT, () => {
    console.log(`server start ${PORT}`);
})