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

var URL = req.query.URL;

res.header('Content-Disposition', 'attachment; filename="video.mp4"');
ytdl(URL, {
    format: 'mp4'
    }).pipe(res);

});
