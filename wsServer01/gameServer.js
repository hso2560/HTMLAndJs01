const WebSocket=require('ws');
const port = 34000;

const LoginHandler = require('./LoginHandler.js')
const SocketState = require('./SocketState.js')

let socketIdx=0;
let userList={}; //로그인한 유저들을 관리하는 리스트
let connectedSocket={};

const wsService = new WebSocket.Server({port},()=>{
    console.log(`웹 소켓이 ${port}에서 구동중...`);
});

const getPayLoad=str=>{
    let idx=str.indexOf(":");
    let op=str.substr(0,idx);
    let payload=str.substr(idx+1);
    return {op, payload};
}

wsService.on("connection",socket=>{
    console.log("소켓 연결");

    socket.state=SocketState.IN_LOGIN;
    socket.id=socketIdx;
    connectedSocket[socketIdx]=socket;
    socketIdx++;

    socket.on("close",()=>{
        console.log("소켓 끊김");
        delete connectedSocket[socket.id];
        delete userList[socket.id];
    });

    socket.on("message",msg=>{
        try{
            const data=JSON.parse(msg);
            if(data.type==="LOGIN"){
                let userData = LoginHandler(data.payload, 
                    socket);
                userList[socket.id]=userData;
                return;
            }
        }
        catch(err){
            console.log("잘못된 요청 발생");
            console.log(err);
        }
    });
});