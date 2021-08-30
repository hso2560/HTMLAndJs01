let request=require('request');
let fs=require('fs');
let cheerio=require('cheerio');

let url="https://namu.wiki/w/%EC%A7%84(%EB%A6%AC%EA%B7%B8%20%EC%98%A4%EB%B8%8C%20%EB%A0%88%EC%A0%84%EB%93%9C)?from=%EB%A1%A4%20%EC%A7%84";
request(url,(err,res,body)=>{
    let c=cheerio.load(body);
    let list=c(".wiki-paragraph");
    for(let i=0; i<list.length; i++)
    {
        let text=list.eq(i).text();
        console.log(text);
    }
});

