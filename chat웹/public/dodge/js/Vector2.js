class Vector2 {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    //벡터 정규화
    normalized(){
        if(this.x == 0 && this.y == 0 ){
            return {x:0, y:0};
        }

        let d = Math.sqrt(this.x * this.x + this.y * this.y);
        
        
        return {x : this.x / d, y: this.y / d};
    }
}