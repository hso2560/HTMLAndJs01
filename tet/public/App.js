import {Game} from '/Game.js';
import {$} from '/Query.js';

class App {
    constructor(){
        this.socket = new io();
        this.addSocketEvent();
        
        this.pageContainer = $(".page-container");
        this.init();
        
        this.game = new Game(this.socket);
        Game.instance = this.game;
    }

    init(){
        //로그인 버튼 클릭시
        $("#btnLogin").addEventListener("click", ()=> {
            let email = $("#loginEmail").value;
            let pw = $("#loginPassword").value;

            if(email.trim() === "" || pw.trim() === "" ) {
                alert("필수값이 비어있습니다");
                return;
            }

            this.socket.emit("login-process", {email, pw});
        });

        $("#btnStart").addEventListener("click", ()=>{
            this.socket.emit("game-start");
            //this.game.start();
        });
        $("#btnStart").addEventListener("keydown", e => {
            e.preventDefault();
            return false;
        });

        //회원가입 버튼 눌렀을 때
        $("#btnRegister").addEventListener("click", e => {
            this.registerProcess(); //회원가입절차 진행
        });

        $("#btnCreateRoom").addEventListener("click", e => {
            this.createRoom(); //방생성 프로세스
        });
        $("#btnLobby").addEventListener("click",e=>{
            this.socket.emit("goto-lobby");
            this.pageContainer.style.left="-1024px";
            this.socket.emit("room-list");
        });
        $("#btnRefreshRoom").addEventListener("click",e=>{
            this.socket.emit("room-list");
        });
        $("#btnRank").addEventListener("click",e=>{
            this.socket.emit('rank-list');
        });


        //디버그용 이벤트
        document.addEventListener("keydown", e => {
            //console.log(e.keyCode); // q == 81, w == 87
            if(e.keyCode == 81){
                this.debug("4321","1234");
                setTimeout(()=>{
                    this.socket.emit("create-room", {name:"더미 방입니다"});
                }, 500);
            }else if(e.keyCode == 87){
                //만들어진 첫번째방 들어가기
                this.debug("4444", "1234");
                setTimeout(()=>{
                    this.socket.emit("join-room", {roomName:1});
                }, 500);
            }
        });
    }

    addSocketEvent()
    {
        this.socket.on("register-response", data => {
            alert(data.msg); 

            //성공시 입력창 지워주기
            if(data.status){
                $("#registerEmail").value = "";
                $("#registerName").value = "";
                $("#registerPass").value = "";
                $("#registerPassConfirm").value = "";
            }
        });
        
        this.socket.on("login-response", data => {
            //alert(data.msg);
            console.log(data);
            if(data.status){
                $("#loginEmail").value = "";
                $("#loginPassword").value = "";
                this.pageContainer.style.left = "-1024px";

                this.makeRoomData(data.roomList);
            }
        });

        this.socket.on("room-list",data=>{
            const {roomList} = data;
            this.makeRoomData(roomList);
        });

        //자기가 만들고 참가
        this.socket.on("enter-room", data => {
            this.pageContainer.style.left = "-2048px";
            this.game.reset();
            $("#btnStart").disabled=false;
        });

        //다른 사람 방에 참가
        this.socket.on("join-room",data=>{
            this.pageContainer.style.left="-2048px";
            //$("#btnStart").style.visibility="hidden";
            this.game.reset();
            $("#btnStart").disabled=true;
        });

        this.socket.on("bad-access",data=>{
            alert(data.msg);
        });
        this.socket.on("game-start",data=>{
            this.game.start();
            this.socket.emit("in-playing");
            document.querySelector("#btnStart").disabled=true;
        });
        this.socket.on("rank-list",data=>{
            console.log(data.result);
            let rankList=$("#rankList");
            rankList.innerHTML="";
            data.forEach((x,idx)=>{
                let li=document.createElement("li");
                li.innerHTML=`${idx+1}등 ${x.name} : ${x.win} 승, ${x.lose} 패`;
                rankList.appendChild(li);
            })
        });
    }

    createRoom()
    {
        let result = prompt("방 이름을 입력하세요");
        if(result !== null && result !== "")
        {
            this.socket.emit("create-room", {name:result});
        }else{
            alert("방이름이 있어야 합니다.");
        }
    }

    registerProcess()
    {
        let email = $("#registerEmail").value;
        let name = $("#registerName").value;
        let pw = $("#registerPass").value;
        let pwc = $("#registerPassConfirm").value;

        if(email.trim() === "" || name.trim() === "" || pw.trim() === "" || pw !== pwc){
            alert("공백이거나 비밀번호 확인이 일치하지 않습니다.");
            return;
        }        
        this.socket.emit("register-request", {email, name, pw, pwc});
    }

    makeRoomData(roomList){
        const roomBox = $("#roomListBox");
                roomBox.innerHTML = "";
                roomList.forEach(room => {
                    let div = document.createElement("div");
                    div.classList.add("room");
                    div.innerHTML = `<span class="name">${room.name}</span>
                                    <span class="number">${room.number}</span>`;
                    div.addEventListener("click", e => {
                        this.socket.emit("join-room", {roomName:room.roomName});
                    });

                    roomBox.appendChild(div);
            });
    }

    debug(id, pw){
        $("#loginEmail").value = id;
        $("#loginPassword").value = pw;
        $("#btnLogin").click();
    }
}

// function $(css)
// {
//     return document.querySelector(css);
// }

window.addEventListener("load", e => {
    let app = new App();
});