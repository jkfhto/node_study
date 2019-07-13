const http = require('http');
const languagesPackage = {
    en: {
        message: 'hello'
    },
    'zh-CN': {
        message: '你好'
    },
    ja: {
        message: 'こんにちは'
    }
}
let languageDefault = 'en';
http.createServer((req, res) => {
    // 获取请求头中的语言和权重
    const lan = req.headers['accept-language'];
    // 如果客户端设置了语言
    if (lan) { // zh-CN, zh;q=0.9  ,en;q=0.8  => [{name:'zh-CN',q:1},{name:'zh-CN',q:1},{name:'zh-CN',q:1}] name:语言名 q:权重
        const languagelist = lan.split(',').map(l => {
            const [name, q = 'q=1'] = l.split(';');
            console.log(q)
            return {
                name,
                q: q.split('=')[1]
            }
        }).sort((a, b) => b.q - a.q);// 根据权重q 降序排序
        const keys = Object.keys(languagesPackage);
        // 循环检测 languagesPackage 是否存在客户端的语言
        for (let i = 0; i < languagelist.length; i++) {
            const lanName = languagelist[i].name;
            const exitsLan = keys.includes(lanName); //判断是否支持相关语言
            if (exitsLan) {
                res.setHeader("Content-Language", lanName);
                res.setHeader("Content-Type", "text/plain;charset=utf-8");
                return res.end(languagesPackage[lanName].message);
            }
        }
        ; // [en,zh-cn,ja]
        res.setHeader("Content-Language", languageDefault);
        res.setHeader("Content-Type", "text/plain;charset=utf-8");
        res.end(languagesPackage[languageDefault].message);
    } else {
        res.setHeader("Content-Language", languageDefault);
        res.setHeader("Content-Type", "text/plain;charset=utf-8");
        res.end(languages[languageDefault].message);
    }
}).listen(3000);