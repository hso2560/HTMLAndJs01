const http=require('http');

//http 웹서버 => 요청과 응답
const server=http.createServer(function(req,res){
    res.write("<h1>Hello node server</h1>");
    res.end("<p>끝남</p>");
});

server.listen(8000);