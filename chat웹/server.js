const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const app = new express();
const server = http.createServer(app); 
const path = require('path');

const State = require('./State');

app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, "views", "index.html"));
});
const io = socketio(server); //이렇게하면 서버에 소켓이 붙는다.
//io는 서버의 모든 소켓을 관리하는 객체
//on은 이벤트를 연결해주는 것으로 addEventListener과 동일

let roomList=[];

// let roomList = [
//     {title:"dummyRoom1", roomNo:1, number:1, maxNumber:4},
//     {title:"dummyRoom2", roomNo:2, number:1, maxNumber:4}
// ];

let maxNo = roomList.map( x => x.roomNo);

let conSo = {};

io.on("connection", socket => {
    console.log(`${socket.id} is connected`);
    socket.state = State.IN_LOGIN; //처음 접속하면 로그인 상태로 만든다.

    socket.on("disconnecting", ()=>{
        console.log(`${socket.id} is disconnected`);//소켓 연결 종료

        let list = [...socket.rooms].filter(x=>x!==socket.id);
        list.forEach(r=>{
            let findRoom=roomList.find(x=>x.roomNo===r);
            findRoom.number--;
            if(findRoom.number===0){
                let idx=roomList.findIndex(x=>x.roomNo===r);
                roomList.splice(idx,1);
            }
            else
            {
                io.to(roomNo).emit("chat",{sender:socket.id,msg:"님이 나갔습니다."});
            }
        });

        delete conSo[socket.id];
    });

    socket.on("login", data => {
        socket.nickName = data.nickName;
        socket.state = State.IN_LOBBY; //로비로 진입시킨다.

        conSo[socket.id] = socket;
        socket.emit("login", {roomList});  //로그인시 서버의 방정보 리스트를 보낸다.

    
    });

    socket.on("enter-room",async data=>{
        if(socket.state !==State.IN_LOBBY){
            socket.emit("bad-access",{msg:"잘못된 접근입니다"});
            return;
        }

        const {roomNo}=data; //data.roomNo
        let targetRoom=roomList.find(x=>x.roomNo === roomNo);

        if(targetRoom === undefined){
            socket.emit("bad-access",{msg:"존재하지 않는 방입니다"});
            return;
        }
        if(targetRoom.number>=targetRoom.maxNumber){
            socket.emit("bad-access",{msg:"방이 가득 찼습니다"});
            return;
        }

        socket.join(roomNo);
        let  userList=[...await io.in(roomNo).allSockets()];

        // let dataList=[];
        // for(let i=0; i<userList.length; i++){
        //     const id=userList[i];
        //     const nickName=conSo[id].nickName;
        //     dataList.push({id,nickName});
        // }
        // userList=dataList;
        userList=userList.map(id=>({id,nickName:conSo[id].nickName}) );

        socket.emit("enter-room");
        io.to(roomNo).emit("user-refresh",{userList});

        socket.state=State.IN_CHAT;
        targetRoom.number++;
        console.log(socket.rooms);
    });

    socket.on("chat", data => {
        if(socket.state !== State.IN_CHAT)
        {
            socket.emit("bad-access",{msg:"잘못된 접근입니다"});
            return;
        }

        let {msg, nickName} = data;

        let room=socket.rooms;

        let list = [...room].filter(x => x != socket.id);

        for(let i = 0; i < list.length; i++){
            io.to(list[i]).emit("chat", {sender:socket.id, msg, nickName});
        }
        console.log("asd");
    });

    socket.on("create-room",async data=>{
       if(socket.state!==State.IN_LOBBY)
       {
           socket.emit("bad-access",{msg:"잘못된 접근입니다."});
           return;
       }

        const {title}=data;
        const roomNo=1;
        if(roomList.length>0)
        {
            roomNo=Math.max(...roomList.map(x => x.roomNo)) + 1;
        }
        roomList.push({title,roomNo,number:1,maxNumber:4});
        socket.join(roomNo);

        let userList=[{id:socket.id, nickName:socket.nickName}];
        socket.state=State.IN_CHAT;
        socket.emit("enter-room");
        io.to(roomNo).emit("user-refresh",{userList});
    });

});

server.listen(15454, ()=>{
    console.log("서버가 15454포트에서 돌아가고 있습니다.");
});