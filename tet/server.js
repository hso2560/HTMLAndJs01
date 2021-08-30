const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const {Query, Pool} = require('./DB.js');
const State = require("./State.js"); 


const app = new express(); //익스프레스 웹서버 열고
const server = http.createServer(app); //웹서버에 익스프레스 붙여주고
const io = socketio(server);//해당 서버에 소켓도 붙여주고

app.use(express.static('public'));

app.get('/', (req, res) => {
    //어떤 요청이 오건간에 index.html을 보낸다.
    res.sendFile(path.join(__dirname , "views", "index.html"));
});

let roomList = [
    //{name:'', roomName:1, number:1}
];

io.on("connect", socket => {
    console.log(`서버에 새로운 소켓이 착륙했어요 : ${socket.id}`);
    socket.state = State.IN_LOGIN;

    socket.on("disconnecting",async ()=>{
        console.log(`${socket.id}님이 탈주했어요`);

        if(socket.state === State.IN_GAME || socket.state===State.IN_PLAYING){

            let rooms=[...socket.rooms];
            let targetRoom = rooms.find(x=>x!==socket.id);
            let idx=roomList.findIndex(x=>x.roomName === targetRoom);

            roomList[idx].number--;

            if(roomList[idx].number <= 0){
                roomList.splice(idx,1); //해당 방 제거
            }else if(socket.state === State.IN_GAME){
                io.to(roomList[idx].roomName).emit("leave-player",{isAdmin:true});
            }else if(socket.state === State.IN_PLAYING){
                io.to(roomList[idx].roomName).emit("leave-player",{isAdmin:false});

                let sql=`INSERT INTO matches (result, host_id, client_id, client_score,date ,host_score)
                         VALUES( ?, ?, ?, ?,NOW() ,?)`;
                let disconnectedId=socket.loginUser.id;
                
                let list=[...await io.in(roomList[idx].roomName).allSockets()];

                let data=[];

                if(list[0]==socket.id){
                    let otherId=io.sockets.sockets.get(list[1]).loginUser.id;
                    //내가 방장
                    data.push(0);
                    data.push(disconnectedId);
                    data.push(otherId);
                }else{
                    let otherId=io.sockets.sockets.get(list[0]).loginUser.id;
                    //내가 방장 x
                    data.push(1);
                    data.push(otherId);
                    data.push(disconnectedId);
                }
                data.push(0);
                data.push(0);

                await Query(sql,data);
           }
        }
    });

    socket.on("login-process", async data => {
        const {email, pw} = data;
        let sql = "SELECT * FROM users WHERE email = ? AND password = PASSWORD(?)";
        let result = await Query(sql, [email, pw]);
        if(result.length !== 1){
            socket.emit("login-response", {status:false, msg:"로그인 실패"});
            return;
        }

        socket.emit("login-response", {status:true, msg:"로그인 성공",roomList});
        socket.loginUser = result[0]; //로그인된 유저를 socket 데이터에 넣어준다.
        socket.state = State.IN_LOBBY;
    });

    //회원가입 요청이 들어왔을 때 
    socket.on("register-request", async data => {
        const {email, name, pw, pwc} = data;

        if(email.trim() === "" || name.trim() === "" || pw.trim() === "" || pw !== pwc){
            socket.emit(
                "register-response", 
                {status:false, msg:"비어있거나 비밀번호 확인이 올바르지 않습니다"});
            return;
        }

        let sql = "SELECT * FROM users WHERE email = ?";
        let result = await Query(sql, [email]);

        if(result.length != 0){
            socket.emit("register-response", 
                {status:false, msg:"이미 존재하는 회원입니다."});
            return;
        }

        sql = `INSERT INTO users(email, name, password) VALUES (?, ?, PASSWORD(?))`;
        result = await Query(sql, [email, name, pw]);

        if(result.affectedRows == 1){
            socket.emit("register-response", 
                {status:true, msg:"정상적으로 회원가입 되었습니다."});
        }else{
            socket.emit("register-response", 
                {status:false, msg:"데이터베이스 처리중 오류 발생"});
        }
        return;
    });

    socket.on("create-room", data=>{
        if(socket.state !== State.IN_LOBBY){
            socket.emit("bad-access", {msg:"잘못된 접근입니다."});
            return;
        }

        const {name} = data; //방이름 뽑아오고
        const roomName = roomList.length < 1 ? 1 : Math.max(...roomList.map(x => x.roomName)) + 1; //룸 번호만 뽑힐꺼고
        //별도의 방리스트
        roomList.push({name, roomName, number:1});
        socket.join(roomName); //해당 소켓을 해당 룸으로 진입시킴

        socket.state = State.IN_GAME;
        socket.emit("enter-room");
    });

    socket.on("join-room",data=>{
        if(socket.state!==State.IN_LOBBY){
            socket.emit("bad-access",{msg:"잘못된 접근입니다."});
            return;
        }
        const {roomName} = data;
        let targetRoom=roomList.find(x=>x.roomName === roomName);

        if(targetRoom===undefined || targetRoom.number >=2){
            socket.emit("bad-access",{msg:"들어갈 수 없는 방입니다."});
            return;
        }
        socket.join(roomName);
        socket.emit("join-room");
        socket.state = State.IN_GAME;
        targetRoom.number++;
    });
    socket.on("game-start",data=>{

        if(socket.state!==State.IN_GAME){
            socket.emit("bad-access",{msg:"잘못된 접근입니다."});
            return;
        }

        let socketRooms=[...socket.rooms];
        let room = socketRooms.find(x=>x!=socket.id);
        let targetRoom= roomList.find(x=>x.roomName === room);
        if(targetRoom===undefined || targetRoom.number<2){
            socket.emit("bad-access",)
        }

        socketRooms.forEach(x=>{
            io.to(x).emit("game-start",{msg:"시작할 수 없는 상태입니다."});
            return;
        })

        io.to(room).emit("game-start");
    });

    socket.on("in-playing",data=>{
        socket.state=State.IN_PLAYING;
    });

    socket.on("game-data",data=>{
        if(socket.state!==State.IN_PLAYING){
            socket.emit("bad-access",{msg:"잘못된 접근입니다."});
            return;
        }

        let room=findRoom(socket);

        data.sender=socket.id;
        socket.broadcast.to(room).emit("game-data",data);
    });
    socket.on("remove-line",data=>{
        const {count} = data;

        if(socket.state!==State.IN_PLAYING){
            socket.emit("bad-access",{msg:"잘못된 접근입니다."});
            return;
        }

        let room=findRoom(socket);

        data.sender=socket.id;
        socket.broadcast.to(room).emit("remove-line",data);
    });
    socket.on("game-lose",data=>{
        let room=findRoom(socket);
        socket.broadcast.to(room).emit("game-win");
        //this.recordMatchData(socket,room);
    });
    socket.on("goto-lobby",data=>{
        socket.state=State.IN_LOBBY;
        let room=findRoom(socket);
        let idx=roomList.findIndex(x=>x.roomName === room);
        roomList[idx].number--;
        if(roomList[idx].number <= 0){
            roomList.splice(idx,1);
        }
    });
    socket.on("room-list",data=>{
        socket.emit("room-list",{roomList});
    });
    socket.on("rank-list",async ()=>{
        let result=await Query("SELECT id FROM users");
        
        for(let i=0; i<result.length; i++){
            let win=await Query(`SELECT users.name, users.email, count(*) AS cnt FROM matches, users
            WHERE ((matches.host_id = users.id AND matches.result = 1)
            OR(matches.client_id = users.id AND matches.result = 0))
            AND users.id = ?`,[result[i].id]);
            result[i].win=win[0].cnt;

            let lose= await Query(`SELECT users.name, users.email, count(*) AS cnt FROM matches, users
            WHERE ((matches.host_id = users.id AND matches.result = 0)
            OR(matches.client_id = users.id AND matches.result = 1))
            AND users.id = ?`,[result[i].id]);
            result[i].lose=lose[0].cnt;
        }
        result.sort((a,b)=>(b.win-b.lose)-(a.win-a.lose));
           socket.emit("rank-list",data=>{
            console.log(data.result);
        });
    });
});

function findRoom(socket){
    let socketRooms=[...socket.rooms];
    let room=socketRooms.find(x=>x!=socket.id);
    return room;
}

async function recordMatchData(depeatSocket, roomName) {
    let sql=`INSERT INTO matches (result, host_id, client_id, client_score,date ,host_score)
                         VALUES( ?, ?, ?, ?,NOW() ,?)`;
    let list = [...await io.in(roomName).allSockets()];

    let data = [];
    if (list[0] === depeatSocket.id) {
        //내가 방장
        data.push(0); //방장패배
        data.push(depeatSocket.loginUser.id);
        data.push(io.sockets.sockets.get(list[1]).loginUser.id);
    } else {
        //상대가 방장
        data.push(1); //방장승리
        data.push(io.sockets.sockets.get(list[0]).loginUser.id);
        data.push(depeatSocket.loginUser.id);
    }
    data.push(0);
    data.push(0);
    await Query(sql, data); //전적정보의 기록
}

server.listen(9000, ()=> {
    console.log(`Server is running on 9000 port`);
});