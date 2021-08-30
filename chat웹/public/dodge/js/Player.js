class Player {
    constructor(x, y, w, h, imgSrc){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = new Image();
        this.img.src = imgSrc;
        this.speed = 150;
    }

    update(d){
        let h = 0;
        let v = 0;
        if(InputSystem.getKey(37)) {
            h = -1;
        }else if(InputSystem.getKey(39)){
            h = 1;
        }
        
        if(InputSystem.getKey(38)){
            v = -1;
        }else if(InputSystem.getKey(40)){
            v = 1;
        }

        let dir = new Vector2(h, v).normalized();
        
        this.x += dir.x * this.speed * d;
        this.y += dir.y * this.speed * d; 
    }

    render(ctx){
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }

    checkCol(bullet){
        let x = this.x + this.w / 2;
        let y = this.y + this.h / 2;

        let d = Math.sqrt((bullet.x - x) * (bullet.x - x) + (bullet.y - y) * (bullet.y - y));
        return d < bullet.r + this.w/2;
    }
}