const express=require('express');
const http=require('http');
const jwt=require('jsonwebtoken');
//Oauth, jwt가 있다


//익스프레스 웹 서버 구축
const app=new express();
const server=http.createServer(app);

//post로 넘어오는 데이터들을 json파싱해주고 한글 받아줌
app.use(express.json());
app.use(express.urlencoded({extended:true}));

let port=54000;

//서버 구동
server.listen(port,()=>{
    console.log(`Server is running on ${port} port`);
});

//GET요청으로 /save_data라는 주소에 요청 보내면 요청은 req에 응답은 res에 기록
//http://localhost:54000/save_data 주소에 나타난다.
//GET, POST
app.post('/login',(req,res)=>{
    //res.json({name:"명재문", wtf:true});
    //아이디와 비번 받고 데이터베이스에 그 값 있는지 확인후 있으면 토큰 발행
    let token=jwt.sign({
        email:"gondr99@gmail.com",
        level:5
    },"ggm",{expiresIn:"24h"})  //데이터, 비밀키, 옵션
      //이렇게 말고 따로 빼서 require로 써야함
    res.json({success:true, msg:token});
});

app.post('/save_data',(req,res)=>{
    let koken=req.body.token;
    if(token===undefined || token=="")
    {
        res.json({success:false,msg:"잘못된 접근입니다"});
        return;
    }
    try{
        let decoded=jwt.verify(token,"ggm");
        if(decoded){
            console.log(req.body);
            res.json({success:true, g:"데이터 저장 성공"});
        }else{
            res.json({success:false,msg:"잘못된 접근입니다"});
        }
    }catch(err){
        res.json({success:false,msg:"잘못된 접근입니다"});
    }
    //console.log(req.body);
    //res.json({success:true, msg:'데이터 저장 성공'});
});