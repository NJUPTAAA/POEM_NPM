var supportStandard=["1.0"];

function isJson(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }

        } catch(e) {
            console.log('error：'+str+'!!!'+e);
            return false;
        }
    }
    return false;
}

exports.parse = function (_poemPath, type="auto") {
    if (type=="auto") {
        type=isJson(poemRaw)?"poem":"poetry";
    }

    if (type=="poem") {
        ret=JSON.parse(poemRaw);
    } else if (type=="poetry") {
        let tmpPath=__dirname + "/tmp/" + new Date().getTime();
        fs.createReadStream(_poemPath).pipe(unzip.Parse()).pipe(fstream.Writer(tmpPath));
        ret=[];
    }

    return ret;
};

exports.generate = function (_poemRaw, type="poem") {
    console.log("This is my first module");
};
