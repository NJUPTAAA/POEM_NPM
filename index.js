const supportStandard=["1.0"];
const unzip = require('unzip');
const path = require('path');
const fs = require('fs');

exports.parse = function (_poemPath, type="auto", callback=null) {
    var ret={};

    if (type=="auto") {
        type=path.extname((_poemPath))===".poem"?"poem":"poetry";
    }

    if (type=="poem") {
        try {
            ret=JSON.parse(fs.readFileSync(_poemPath));
            if(typeof callback === "function") {
                callback(ret);
            }
        }catch(e){
            console.warn(e);
            callback({});
        }
    } else if (type=="poetry") {
        try {
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
                    if(type=='File') {
                        entry.pipe(fs.createWriteStream(tmpPath+fileName)).once("close",function () {
                            ret=JSON.parse(fs.readFileSync(tmpPath+fileName));
                        });
                        procced=true;
                    }
                }
            }).on('error', function (e) {
                console.warn(e);
                callback({});
            }).once("close",function () {
                if(typeof callback === "function") {
                    callback(ret);
                }
            });
        } catch(e) {
            console.warn(e);
            callback({});
        }
    }
};

exports.generate = function (_poemRaw, type="poem") {
    console.log("Not Finished");
};
