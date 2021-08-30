const express=require('express');
const http=require('http');
const jwt=require('jsonwebtoken');

const app=new express();
const server=http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

let port=52322;

server.listen(port,()=>{
    console.log(`Server is running on ${port} port`);
});

