const mysql=require('mysql2');
const connectionData=require("./secret.js");

const pool=mysql.createConnection(connectionData);
const promisePool=pool.promise();

async function Query(sql,data=[])
{
    const [rows,field] = await promisePool.query(sql,data);
    return rows;
}

module.exports={
    Query,
    Pool:promisePool
}