const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

let titleId=process.argv[2];
let no=process.argv[3];
let no2=process.argv[4];
let uri;

for(let j=no; j<=no2; j++)
{
    uri=`https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${j}`;

    request(uri,function(err,res,body){
        let $=cheerio.load(body);  //변수 이름이 $
    
        let list=$(".wt_viewer > img");

        mkdir(titleId+"/"+j);

        for(let i=0; i<list.length; i++)
        {
            let src=list.eq(i).attr("src");
            download(src,`${titleId}/${j}/${i}.jpg`);
            //console.log(src);
        }
    });
}

 function mkdir(dirPath)
 {
     const isExists=fs.existsSync(dirPath);
     if(!isExists){
         fs.mkdirSync(dirPath,{recursive: true});
     }
 }

function download(src,filename){
    let option={
        method:"GET",  // POST, PUT, DELETE
        uri:src,
        headers:{"User-Agent":"Mozilla/5.0"},
        encoding:null
    }

    let fileStream=fs.createWriteStream(filename);
    request(option).pipe(fileStream);
}

//const request = require('request');
//const cheerio = require('cheerio');

// let uri="https://namu.wiki/w/%EB%AC%BC";

// request(uri,function(err,res,body){
//     let $=cheerio.load(body);

//     let list=$(".wiki-paragraph");

//     for(let i=0; i<list.length; i++)
//     {
//         let data=list.eq(i).text();
//         console.log(data);
//     }
    
// });