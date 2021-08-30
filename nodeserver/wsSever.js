const WebSocket = require('ws');
const Point = require('./Point');
const Vector3 = require('./Vector3');
const port = 32000;

//wsService는 내부에 clients라는 속성을 가지고 있고 해당 
//속성을 이용해서 브로드캐스트등을 구현할 수 있다.
let socketIdx = 0;
let connectedSocket = {};
let userList = {}; //로그인한 유저리스트


const wsService = new WebSocket.Server({port}, ()=>{
    console.log("웹소켓 서버 스타트");
    //상태정보 데이터 갱신 루프 :초당 60번 수행한다.
    setInterval(()=>{
        let keys = Object.keys(userList);
        let dataList = [];
        for(let i = 0; i < keys.length; i++){
            dataList.push(userList[keys[i]]);
        }
        //모든 소켓에 데이터 갱신해줌.
        wsService.clients.forEach(s => {
            s.send(JSON.stringify({type:"Refresh", payload:JSON.stringify({dataList})}));
        });
    }, 1000 / 60); 
});

//데이터 전송간 명령어와 페이로드 구분해주는 함수
const getPayload = str => {
    let idx = str.indexOf(":");
    let op = str.substr(0, idx);
    let payload = str.substr(idx+1);
    return {op, payload};
};

const State = {
    IN_LOGIN:0,
    IN_GAME:1,
}

wsService.on("connection", socket => {
    socket.send( JSON.stringify({payload:"Welcome", type:"Chat"}));
    socket.state = State.IN_LOGIN;
    socket.id = socketIdx;
    connectedSocket[socketIdx] = socket;
    socketIdx++;
    
    //소켓 접속 해제시 
    socket.on("close", ()=>{
        console.log(`${socket.id} 접속 해제`);
        delete connectedSocket[socket.id];
        delete userList[socket.id];
    });

    //소켓에 메시지 도착시
    socket.on("message", msg =>{
        const data = JSON.parse(msg);
        if(data.type === "Login"){
            LoginHandler(data, socket);
        }
        if(data.type === "Transform"){
            TransformHandler(data, socket);
        }
    });
});

function TransformHandler(data, socket){
    let payload = JSON.parse(data.payload);
    let user = userList[payload.socketId + ""];
    
    user.point = payload.point;
    user.rotation = payload.rotation;
    user.turretRotation = payload.turretRotation; //데이터 갱신
}

function LoginHandler(data, socket){
    const {tank, name} = data;
    let x = Math.floor(Math.random() * 12 - 6);
    let y = Math.floor(Math.random() * 12 - 6);
    let point = new Point(x, y);
    socket.state = State.IN_GAME;

    let sendData = JSON.stringify({
        type:"Login", 
        payload:JSON.stringify({point, rotation:Vector3.zero, turretRotation:Vector3.zero, socketId:socket.id, tank})
    });
    
    userList[socket.id] = {
        point, 
        rotation:Vector3.zero, 
        turretRotation:Vector3.zero, 
        socketId:socket.id,
        tank
    };
    socket.send(sendData);
}



wsService.on('listening', ()=>{
    console.log(`server listen on ${port}`);
});



