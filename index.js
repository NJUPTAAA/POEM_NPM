const supportStandard=["1.0"];
const supportType=["OnlineJudge"];
const supportFormat=["poem", "poetry"];
const standard="1.0";
const unzip = require('unzip');
const path = require('path');
const fs = require('fs');
const JSZip = require('JSZip');
const _ = require("lodash");

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
            let tmpPath=__dirname + "/tmp/";
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath);
            }
            tmpPath=__dirname + "/tmp/" + new Date().getTime() + "/";
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
                            if(typeof callback === "function") {
                                callback(ret);
                            }
                        });
                        procced=true;
                    }
                }
            }).on('error', function (e) {
                console.warn(e);
                callback({});
            });
        } catch(e) {
            console.warn(e);
            callback({});
        }
    }
};

function val(value, defVal){
    return value===undefined ? defVal : value;
}

function prepareJSON(_poemRaw) {
    let poemGeneral={
        "generator": "POEM_NPM",
        "url": "https://github.com/NJUPTAAA/POEM_NPM",
        "description": "",
    };
    poemGeneral={
        "standard": standard,
        ..._.merge(poemGeneral, _.pick(_poemRaw.general,Object.keys(poemGeneral))),
    };
    let problems=_poemRaw.problems;
    let poemProblems=[];
    let poemProblem={
        "title": "Untitled Problem",
        "description": "",
        "input": "",
        "output": "",
        "note": "",
    };
    problems.forEach(_problem => {
        let problem={
            ..._.merge(poemProblem, _.pick(_problem,Object.keys(poemProblem))),
            require: {
                MathJax:_problem.require.MathJax==true
            },
            resources: [],
            timeLimit: {
                unit: "ms",
                value: _problem.time_limit * 1 || 0
            },
            memoryLimit: {
                unit: "kb",
                value: _problem.memory_limit * 1 || 0
            },
            source: {
                url: val(_problem.source.url,null),
                name: val(_problem.source.name,null)
            },
            sample: [],
            extra: {
                markdown: Boolean(val(_problem.extra.markdown, true)),
                forceRaw: Boolean(val(_problem.extra.forceRaw, false)),
                partial: Boolean(val(_problem.extra.partial, false)),
                totScore: _problem.extra.totScore >> 0 || 0,
            },
            testCases: [],
            specialJudge: Boolean(val(_problem.specialJudge, false)),
            solution: []
        };
        if(supportType.includes(_problem.type)) problem.type=_problem.type;
        else throw "Unsupported Type";
        if(problem.type==="OnlineJudge"){
            problem.extra.totScore=_problem.testCases.length;
        }
        _problem.sample.forEach(_sample=>{
            problem.sample.push(_.merge({
                'input':'',
                'output':''
            }, _.pick(_sample,['input','output'])));
        });
        _problem.testCases.forEach(_testCase=>{
            problem.testCases.push(_.merge({
                'input':'',
                'output':''
            }, _.pick(_testCase,['input','output'])));
        });
        poemProblems.push(problem);
    });
    return JSON.stringify({
        ...poemGeneral,
        problems: poemProblems
    });
}

function saveTo(JSONString, filePath, format, callback) {
    if(supportFormat.includes(format)) {
        switch(format) {
            case "poem":
                try {
                    fs.writeFileSync(filePath, JSONString);
                    if(typeof callback === "function") {
                        callback({path:filePath,raw:JSONString},{});
                    }
                }catch(e){
                    console.warn(e);
                    if(typeof callback === "function") {
                        callback({},{msg:e});
                    }
                }
                break;
            case "poetry":
                try {
                    let tmpPath=__dirname + "/tmp/";
                    if (!fs.existsSync(tmpPath)) {
                        fs.mkdirSync(tmpPath);
                    }
                    tmpPath=__dirname + "/tmp/" + new Date().getTime() + "/";
                    if (!fs.existsSync(tmpPath)) {
                        fs.mkdirSync(tmpPath);
                    }
                    var zip = new JSZip();
                    zip.file(path.basename(filePath, '.poetry')+'.poem', JSONString);
                    zip.generateAsync({type:"nodebuffer"}).then(function(content) {
                        fs.writeFileSync(filePath, content);
                        if(typeof callback === "function") {
                            callback({path:filePath,raw:JSONString},{});
                        }
                    });
                } catch(e) {
                    console.warn(e);
                    if(typeof callback === "function") {
                        callback({},{msg:e});
                    }
                }
                break;
            default:
                throw "Unsupported Format";
        }
    }
    else throw "Unsupported Format";
}

exports.generate = function (_poemRaw, filePath, format, callback=null) {
    saveTo(prepareJSON(_poemRaw), filePath, format, callback);
};
