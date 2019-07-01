const supportStandard=["1.0"];
const fstream = require('fstream');
const unzip = require('unzip');
const path = require('path');
const fs = require('fs');

exports.parse = function (_poemPath, type="auto") {
    if (type=="auto") {
        type=path.extname((_poemPath))===".poem"?"poem":"poetry";
        console.log(path.extname((_poemPath)));
    }

    if (type=="poem") {
        ret=JSON.parse(fs.readFileSync(_poemPath));
    } else if (type=="poetry") {
        let tmpPath=__dirname + "/tmp/" + new Date().getTime();
        fs.createReadStream(_poemPath).pipe(unzip.Parse()).pipe(fstream.Writer(tmpPath));
        ret=[];
    }
    console.log(ret);
    return ret;
};

exports.generate = function (_poemRaw, type="poem") {
    console.log("This is my first module");
};
