const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const mysql = require("mysql2/promise");
const s = require("./secret");
const connPool = mysql.createPool(s);

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "db.html"));
});

app.get("/game", (req, res)=>{
    res.sendFile(path.join(__dirname, "views", "dodge.html"));
});

io.on("connection", socket =>{
    console.log(`유저 연결 : ${socket.id}`);

    socket.on("saveScore", async data => {
        let {name, score, msg} = data;
        let con = await connPool.getConnection();
        const sql = `INSERT INTO score_list(name, score, msg) VALUES (?, ?, ?)`;  //SELECT * FROM score_list ORDER BY score DESC LIMIT 5
        let result = await con.query(sql, [name, score, msg]);
        if(result[0].affectedRows == 1) {
            socket.emit("msg", {msg:"기록 완료되었습니다."});
        }

        const sql2 = `SELECT * FROM score_list ORDER BY score DESC LIMIT 0, 5`;
        let result2=await con.query(sql2);
        socket.emit("refreshscore",result2[0]);
    });
    //메세지 ? TOP10

    socket.on("refreshscore", async data=>{
        let con = await connPool.getConnection();
        const sql = `SELECT * FROM score_list ORDER BY score DESC LIMIT 0, 5`;
        let result = await con.query(sql);
        
        socket.emit("refreshscore",result[0]);
    });

    socket.on("register", async data => {
        //register라는 메시지로 data가 넘어온다.
        let {name, email, pass} = data;
        let con = await connPool.getConnection();
        try {
            const sql = `INSERT INTO users (name, email, password)
                         VALUES (?, ?, PASSWORD(?) )`;
            let result = await con.query(sql, [name, email, pass]);
            if(result[0].affectedRows == 1) {
                socket.emit("msg", {msg:"성공적으로 회원가입되었습니다."});
            }
        }catch(e){
            socket.emit("msg", {msg:"회원가입 중 오류 발생"});
        }
    });
});

server.listen(15454, ()=>{
    console.log("서버가 15454 포트에서 구동중입니다");
});
