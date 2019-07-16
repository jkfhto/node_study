let http = require('http');


http.createServer((req, res) => {
    res.end('4000 cn');
}).listen(4000);