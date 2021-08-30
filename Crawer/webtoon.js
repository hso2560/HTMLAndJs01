let request=require('request');
let cheerio=require('cheerio');
let fs=require('fs');

let titleId=process.argv[2];
let no=process.argv[3]*1;
let no2=process.argv[4]*1;





for(let j=no; j<=no2; j++){
    let url=`https://comic.naver.com/webtoon/detail.nhn?titleId=${titleId}&no=${j}`;

    let folder=`${__dirname}/${titleId}/${j}화`;
    if(!fs.existsSync(folder)){
    fs.mkdirSync(folder,{recursive:true});
    }

    let html="";

    request(url,(err,res,body)=>{
        let c=cheerio.load(body);
        let imgList=c(".wt_viewer > img");
    
        for(let i=0; i<imgList.length; i++){
            let src=imgList.eq(i).attr("src");
            download(src,i+".jpg",folder);
            html+="<img src="+titleId+"/"+j+"화/"+i+".jpg>";
        }

        fs.writeFileSync(__dirname+"/index.html",html);
     });
}

function download(src,filename,dir)
{
    let option={
        method:"GET",
        uri:src,
        headers:{"User-Agent":"Mozilla/5.0"},
        encoding:null
    };

    request(option).pipe(fs.createWriteStream(dir+"/"+filename));
}