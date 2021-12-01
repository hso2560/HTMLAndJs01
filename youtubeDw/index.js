const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

let port = 4200;

app.use(cors());
app.listen(port, () => {
    console.log('Server Works !!! At port '+port);
});

app.get('/download', (req,res) => {

let URL = req.query.URL;
let title = Math.random()*100000; //req.query.title;

console.log('download');

//mp4
// res.header('Content-Disposition', `attachment; filename="${title}.mp4`);
// ytdl(URL, {
//     format: 'mp4'
//     }).pipe(res);
  
//mp3
res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
ytdl(URL,{
    "format":'mp3',
    "quality":'lowest'
}).pipe(res);
});
