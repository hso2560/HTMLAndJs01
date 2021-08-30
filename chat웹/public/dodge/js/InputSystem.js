class InputSystem{
    static instance = new this();
    static getKey(code) {
        return InputSystem.instance.getKeycode(code);
    }
    
    constructor(){
        this.keyArr = [];
        document.addEventListener("keydown", e => {
            this.keyArr[e.keyCode] = true;
        });
        document.addEventListener("keyup", e => {
            this.keyArr[e.keyCode] = false;
        });
    }

    getKeycode(code){
        return this.keyArr[code];
    }
}