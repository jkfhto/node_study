let http = require('http');


http.createServer((req, res) => {
    res.end('3000 cn');
}).listen(3000);