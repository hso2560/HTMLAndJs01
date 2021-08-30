const WebSocket = require('ws');
const port = 34000;

const LoginHandler = require('./LoginHandler.js');
const SocketState = require('./SocketState');
const tankData = require('./GameData.js');

let socketIdx = 0;
let userList = {}; //로그인한 유저들을 관리하는 리스트
let connectedSocket = {}; //연결된 소켓들을 관리

const wsService = new WebSocket.Server({port}, () => {
    console.log(`웹 소켓이 ${port}에서 구동중`);
});

const getPayLoad = str => {
    let idx = str.indexOf(":");
    let op = str.substr(0,idx);
    let payload = str.substr(idx+1);
    return {op,payload};
}

wsService.on("connection", socket => {
    console.log("소켓 연결");

    socket.state = SocketState.IN_LOGIN; //로그인 대기상태
    socket.id = socketIdx;
    connectedSocket[socketIdx] = socket;
    socketIdx++;

    socket.send(JSON.stringify({type:"INITDATA",payload: JSON.stringify(tankData) }) );

    socket.on("close", () => {
        console.log("소켓 끊김");
        delete connectedSocket[socket.id];
        delete userList[socket.id];
        //이외에 연결 끊겼을 때 해줄 일을 여기다 적어줘야 한다.
        wsService.clients.forEach(soc => {
            if(soc.state !== SocketState.IN_GAME || soc.id === socket.id) return;

            soc.send(JSON.stringify({type:"DISCONNECT", payload:socket.id}));
        });
    });
    socket.on("message", msg => {
        try {
            const data = JSON.parse(msg); //json파싱

            if(data.type == "LOGIN") {
                let userData = LoginHandler(data.payload,socket); //어떤 소켓이 어떤 페이로드를 보냈는가
                userData.kill=0;
                userData.death=0;
                userList[socket.id] = userData;
                return;
            }

            if(data.type === "TRANSFORM") {
                let transformVO = JSON.parse(data.payload);
                if(userList[transformVO.socketId] !== undefined) {
                    //userList를 갱신
                    userList[transformVO.socketId].position = transformVO.position;
                    userList[transformVO.socketId].rotation = transformVO.rotation;
                    userList[transformVO.socketId].turretRotation = transformVO.turretRotation;
                }
                return;
            }
            if(data.type=="FIRE" || data.type==="HIT" || data.type==="RESPAWN"){
                //let fireInfo=JSON.parse(data.payload);
                broadcast(msg,socket);
                return;
            }
            if(data.type==="DEAD"){
                
                let deadVO = JSON.parse(data.payload);
                console.log(deadVO);
                userList[deadVO.socketId].death++;
                userList[deadVO.killerId].kill++;

                broadcast(msg,socket);
                return;
            }
        }catch(err) {
            console.log(`잘못된 요청 발생 : ${msg}`);
            console.log(err);
        } 
    });
});

function broadcast(msg, socket)
{
    wsService.clients.forEach(soc=>{
        if(soc.state!=SocketState.IN_GAME || soc.id==socket.id) return;

        soc.send(msg);
    });
}

setInterval(()=> {
    let keys = Object.keys(userList); //접속한 모든 소켓의 아이디가 배열로 나온다
    let dataList = []; //전송할 배열을 만든다.
    for(let i = 0; i <keys.length; i++) {
        dataList.push(userList[keys[i]]);
    }
    //접속한 모든 클라이언트 소켓이 여기 들어가 있다.
    wsService.clients.forEach(soc => {
        if(soc.state != SocketState.IN_GAME) return;

        soc.send(JSON.stringify({type:"REFRESH", payload:JSON.stringify({dataList}) }) );
    });
}, 100);
