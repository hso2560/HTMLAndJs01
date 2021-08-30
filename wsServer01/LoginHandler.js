const Vector3 = require('./Vector3.js');
const SocketState = require('./SocketState.js')

function LoginHandler(data,socket)
{
    data=Json.parse(data);
    const {tank, name}=data;

    console.log(tank,name);

    socket.state=SocketState.IN_GAME;

    let sendData={
        position:Vector3.zero,
        rotation:Vector3.zero,
        turretRotation:Vector3.zero,
        socketId:socket.id,
        name,
        tank
    }

    const payload=JSON.stringify(sendData);
    const type="LOGIN";
    socket.send(JSON.stringify({type,payload}));

    return sendData;
}

module.exports=LoginHandler;