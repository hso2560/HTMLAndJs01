const SocketState = require('./SocketState.js');
const Vector3 = require('./Vector3.js');

let respawnPoint=[
    new Vector3(-10,10,0),
    new Vector3(-13,4.3,0),
    new Vector3(3,4,0),
    new Vector3(3,9,0),
    new Vector3(-3,4,0)
];

function LoginHandler(data, socket)
{
    data = JSON.parse(data);
    const {tank, name} = data;

    //console.log(tank, name);
    //여기서 탱크가 랜덤한 위치에 등장하도록 처리해줘야 해.
    socket.state = SocketState.IN_GAME;

    let position=respawnPoint[Math.floor(Math.random()*respawnPoint.length)];
    let sendData = {
        //탱크가 제네레이트된 지점
        position:position,
        rotation:Vector3.zero,
        turretRotation:Vector3.zero,
        socketId:socket.id,
        name,
        tank
    }

    const payload = JSON.stringify(sendData);
    const type = "LOGIN";

    socket.send( JSON.stringify({type, payload}));

   
    return sendData;
}

module.exports = LoginHandler;