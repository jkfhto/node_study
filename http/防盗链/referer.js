let http = require('http');
let uuid = require('uuid');
let fs = require('fs').promises;
let {createReadStream} = require('fs');
let path = require('path');
let url = require('url');
let whitList = ['localhost'];
http.createServer(async (req,res)=>{ // referer referrer
    try{
        let {pathname} = url.parse(req.url);
        let absPath = path.join(__dirname,pathname);
        if(pathname === '/favicon.ico') return res.end();
        let statObj = await fs.stat(absPath);
        if(statObj.isFile()){
            // 如果是图片的话 做防盗链
            if(/.jpg|.png/.test(pathname)){
                // 如果直接打开图片没有referer 其他情况都有referer
                let referer = req.headers['referer'] || req.headers['referrer']
                if(referer){ 
                    // 指的是当前请求的网站
                   let host = req.headers.host.split(':')[0] // 当前图片的url
                   let refererUrl = url.parse(referer).hostname; // 引用图片的主机名
                   if(host !== refererUrl){ // 如果来源不相等那就直接出错 返回错误图片
                    console.log(host , whitList)
                    if(whitList.includes(refererUrl)){
                        return createReadStream(absPath).pipe(res); 
                    }
                    createReadStream(path.join(__dirname,'./resources/error.jpg')).pipe(res);
                   }else{
                    createReadStream(absPath).pipe(res); 
                   }
                }else{
                    createReadStream(absPath).pipe(res);
                }
            }else{
                createReadStream(absPath).pipe(res);
            }
        }else{
            res.end(`is Directory`);
        }
    }catch(e){
        console.log(e);
        res.end(`Not Found`);
    }
    
    
}).listen(3000);