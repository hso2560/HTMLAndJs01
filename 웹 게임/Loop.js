let canvas=document.querySelector("#gameCanvas");
let ctx=canvas.getContext("2d");
//캔버스 가져옴

let width=40;
let height=40;
let x=0
let y=0;
let speed=100;
let eSpeed=100;
let ex=50;
let ey=60;
let eWidth=30;
let eHeight=100;
let img=new Image();
img.src="/PlayerS.jpg";

let keyArr=[];
document.addEventListener("keydown",function(e){
    keyArr[e.keyCode]=true;
    // if(e.keyCode==37){
    // x-=10;}
    // else if(e.keyCode==38)
    // {
    //     y-=10;
    // }
    // else if(e.keyCode==39){
    //     x+=10;
    // }
    // else if(e.keyCode==40){
    //     y+=10;
    // }
});
document.addEventListener("keyup",function(e){
keyArr[e.keyCode]=false;
});

function update()
{
    if(keyArr[37]) x-=speed*1/60;
    if(keyArr[38]) y-=speed*1/60;
    if(keyArr[39]) x+=speed*1/60;
    if(keyArr[40]) y+=speed*1/60;

    if(x<=-1) x=-0.5;
    else if(y<=-1) y=-0.5;
    else if(x>=960-width) x=960-width-1;
    else if(y>=480-height) y=480-height-1;

    ey+=-eSpeed*1/60;
    if(ey<=-1)
    {
        ey=-0.3;
        eSpeed*=-1;
    }
    else if(ey>=480-eHeight)
    {
        ey=480-eHeight-1;
        eSpeed*=-1;
    }

    if(x+width>=ex && x<=ex+eWidth && y+width>=ey && y<=ey+eHeight){
        x=0;
        y=0; 
        
    }
    //x+=speed * 1/60;
    
    // if(x>=960)
    // {
    //     x=959;
    //     speed*=-1; 
    // }
    // else if(x<=-1)
    // {
    //     x=-0.8;
    //     speed*=-1;
    // }
}
function render()
{
    ctx.clearRect(0,0,960, 480);
    ctx.fillStyle = "rgba(0,255,0,1)";
    ctx.fillRect(x, y, width, height);
    //ctx.drawImage(ima,x,y,width,height);
    //적을 그리기전에
    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.fillRect(ex, ey, eWidth, eHeight);
}

 setInterval(function(){
      update(); render();
     },1000/60);