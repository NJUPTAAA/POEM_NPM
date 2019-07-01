const supportStandard=["1.0"];
const fstream = require('fstream');
const unzip = require('unzip');
const path = require('path');
const fs = require('fs');

exports.parse = function (_poemPath, type="auto") {
    if (type=="auto") {
        type=path.extname((_poemPath))===".poem"?"poem":"poetry";
    }

    if (type=="poem") {
        ret=JSON.parse(fs.readFileSync(_poemPath));
    } else if (type=="poetry") {
        ret=[];
        let tmpPath=__dirname + "/tmp/" + new Date().getTime() + "/";
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
        var procced=false;
        fs.createReadStream(_poemPath).pipe(unzip.Parse()).on('entry', function (entry) {
            if(procced==true) entry.autodrain();
            else {
                let fileName = entry.path;
                let type = entry.type;
                let size = entry.size;
                if(type=='File'){
                    entry.pipe(fs.createWriteStream(tmpPath+fileName));
                    procced=true;
                    ret=JSON.parse(fs.readFileSync(tmpPath+fileName));
                }
            }
        });
    }
    console.log(ret);
    return ret;
};

exports.generate = function (_poemRaw, type="poem") {
    console.log("Not Finished");
};
