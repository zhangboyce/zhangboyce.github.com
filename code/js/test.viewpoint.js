let http = require('http');
let fs = require('fs');
http.createServer(function(req, res) {
    fs.readFile('../html/test.viewpoint.html', function(err, data) {
        if (err) {
            res.writeHead(404);
            res.end('not found file', err.toString());
            return;
        }
        res.writeHead(200);
        res.end(data);
    })
}).listen(11080);