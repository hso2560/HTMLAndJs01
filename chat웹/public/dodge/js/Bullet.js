class Bullet {
    constructor(xRange, yRange, player){
        this.x;
        this.y;
        this.r = 8;
        this.dir = null;
        this.speed = 60;
        this.xRange = xRange;
        this.yRange = yRange;
        this.player = player;

    }

    reset(){
        let location = Math.floor(Math.random() * 4); // 0 ~ 3
        switch(location){
            case 0:  //위쪽
                this.y = 0;
                this.x = Math.random() * this.xRange;
                break;
            case 1: //아래쪽
                this.y = this.yRange;
                this.x = Math.random() * this.xRange;
                break;
            case 2: //왼쪽
                this.x = 0;
                this.y = Math.random() * this.yRange;
                break;
            case 3:
                this.x = this.xRange;
                this.y = Math.random() * this.yRange;
                break;        
        }
        
        let d = new Vector2(this.player.x - this.x, this.player.y - this.y);
        this.dir = d.normalized(); //정규화 시킨 벡터 넣기
    }


    update(d){
        this.x += this.dir.x * this.speed * d;
        this.y += this.dir.y * this.speed * d;

        if(this.x < -10 || this.y < -10 || this.x > this.xRange + 10 || this.y > this.yRange + 10){
            this.reset();
        }
    }

    render(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#ff0000";
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r - 2, 0, Math.PI * 2 );
        ctx.fillStyle = "#f7ba1e";
        ctx.fill();

        ctx.restore();
    }
}