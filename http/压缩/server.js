const http = require("http");
const fs = require("fs").promises;
const createReadStream = require("fs").createReadStream;
const url = require("url");
const path = require("path");
const mime = require("mime"); //根据文件路径 返回正确的Content-Type
const crypto = require("crypto"); //提供了加密功能，包括对 OpenSSL 的哈希、HMAC、加密、解密、签名、以及验证功能的一整套封装
const zlib = require('zlib'); //提供通过 Gzip 和 Deflate/Inflate 实现的压缩功能


const PORT = 3000;
/**
 * 静态服务：根据不同的路径返回不同的资源
 */

class Server {
    //处理http请求
    async handleRequest(req, res) {
        const {
            pathname
        } = url.parse(req.url);
        let absPath = path.join(__dirname, pathname); //绝对路径

        //处理跨域
        this.handleCrossOrigin(req, res);

        // 在静态文件之前处理 动态的接口
        this.handleRouter(pathname, req, res);

        try {
            const stats = await fs.stat(absPath);
            //处理目录
            if (stats.isDirectory()) {
                absPath = path.join(absPath, "index.html");
                await fs.access(absPath); //判断文件是否存在
            }
            //处理文件
            this.handleFile(absPath, req, res, stats);
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

            res.setHeader("Access-Control-Allow-Credentials", true); //允许携带cookie 客户端也需要进行相关设置才能生效（withCredentials）
            // http 无状态的  跨域是不支持cookie传递的
            res.setHeader("Set-Cookie", "name=hello"); // 后端设置一个cookie

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
        if (pathname === "/user" && req.method === "GET") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
                name: "node"
            }));
        }
        if (pathname === "/user" && req.method === "DELETE") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
                name: "node"
            }));
        }
    }

    //处理文件
    async handleFile(filePath, req, res, stats) {
        console.log("access");
        //处理缓存  缓存不会针对首页
        //处理协商缓存
        const cache = await this.handleNegotiationCache(req, res, stats, filePath);
        if (cache) {
            res.statusCode = 304;
            return res.end();
        }
        //处理强缓存
        this.handleForcedCache(req, res);
        console.log("传输数据");
        res.setHeader("Content-Type", mime.getType(filePath) + ";charset=utf-8");
        this.handleCompress(filePath, req, res, stats); //处理压缩 输出文件
    }

    //处理强缓存
    handleForcedCache(req, res) {
        console.log("处理强缓存");
        // no-cache 表示每次都像服务器验证 浏览器是有缓存
        // no-store 每次都向服务器验证 浏览器是没有缓存
        //添加强缓存 相对时间 优先级比Expires高
        res.setHeader("Cache-Control", "max-age=5");
        //添加强缓存 绝对时间 兼容老版本
        res.setHeader("Expires", new Date(Date.now() + 5 * 1000).toGMTString());
    }

    //协商缓存
    async handleNegotiationCache(req, res, stats, filePath) {
        //Etag if-none-match
        let buffer = await fs.readFile(filePath);
        let md5 = crypto
            .createHash("md5")
            .update(buffer)
            .digest("base64");
        console.log("filePath：" + filePath, md5);
        res.setHeader("Etag", md5);

        let ifNoneMatch = req.headers["if-none-match"];
        if (ifNoneMatch === md5) {
            return true;
        }

        //Last-Modified if-modified-since
        let lastModified = stats.ctime.toGMTString();
        console.log(
            lastModified === req.headers["if-modified-since"],
            req.url,
            req.headers["if-modified-since"]
        );
        res.setHeader("Last-Modified", lastModified);
        let ifModifiedSince = req.headers["if-modified-since"];
        if (ifModifiedSince === lastModified) {
            // 对比最后的修改时间
            return true;
        }
    }

    //处理文件压缩 输出压缩文件 需要设置Content-Encoding 浏览器才能正常解析
    handleCompress(filePath, req, res, stats) {
        const raw = createReadStream(filePath);
        const acceptEncoding = req.headers["accept-encoding"];
        if (!acceptEncoding) {
            acceptEncoding = "";
        }
        if (acceptEncoding.match(/\bgzip\b/)) {
            //处理gzip
            res.setHeader("Content-Encoding", "gzip");
            raw.pipe(zlib.createGzip()).pipe(res);
        } else if (acceptEncoding.match(/\bdeflate\b/)) {
            //处理deflate
            res.setHeader("Content-Encoding", "deflate");
            raw.pipe(zlib.createDeflate()).pipe(res);
        } else {
            //直接通过流输出
            raw.pipe(res);
        }
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
});