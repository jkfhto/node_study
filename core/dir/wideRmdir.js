const fs = require('fs');
const path = require('path');

//广度优先 同步删除
function wideRmdir(filePath){
    let arr = [filePath];
    let index = 0;
    let current;
    //获取文件列表
    while (current = arr[index++]) {
        if (fs.statSync(current).isDirectory()) {
            let dirs = fs.readdirSync(current);
            dirs = dirs.map(item => path.join(current, item));;
            arr = [...arr, ...dirs];
        }
    }
    console.log("目录列表：" + arr);
    //倒序删除
    for (var i = arr.length-1;i>=0;i--){
        let url = arr[i];
        let stat = fs.statSync(url);
        if(stat.isFile()){
            //删除文件
            fs.unlinkSync(url)
        }else{
            //删除文件夹
            fs.rmdirSync(url)
        }
    }

}
const dir = path.resolve(__dirname, "a");
wideRmdir(dir)