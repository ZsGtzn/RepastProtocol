const fs = require("fs");
const path = require("path");
const { exec } = require("child_process")

/**
 * 
 */
let protoFilesDir = path.resolve(__dirname, "../protocols");
let javaOutputDir = path.resolve(__dirname, "../java");
let jsOutputDir = path.resolve(__dirname, "../js");

//
let configFileName = process.argv[2];
if (configFileName != null && configFileName != undefined) {
    //
    configFileName = path.resolve(__dirname, `../customConfigs/${configFileName}`);

    //
    if (!fs.existsSync(configFileName)) {
        console.error(`${configFileName} not exist`);

        //
        return;
    }


    let configCotent = fs.readFileSync(configFileName)
    try {
        let configCotentJson = JSON.parse(configCotent)

        //
        if (configCotentJson.javaOutputDir) {
            javaOutputDir = configCotentJson.javaOutputDir;
        }
        if (configCotentJson.jsOutputDir) {
            jsOutputDir = configCotentJson.jsOutputDir;
        }
    } catch (error) {
        console.error(`${configFileName} should be json string`);
    }
}

//
javaOutputDir = javaOutputDir.replace(/\\/g, "/");
jsOutputDir = jsOutputDir.replace(/\\/g, "/");

if (!fs.existsSync(javaOutputDir)) {
    fs.mkdirSync(javaOutputDir)
}

if (!fs.existsSync(jsOutputDir)) {
    fs.mkdirSync(jsOutputDir)
}

/**
 * 
 */
let protoFileList = []

function fetchProtoFiles(dir) {
    const fileNameList = fs.readdirSync(dir);
    for (let fileName of fileNameList) {
        //
        let filePath = path.resolve(dir, fileName);

        //
        if (fs.lstatSync(filePath).isDirectory()) {
            fetchProtoFiles(filePath);
        }
        else {
            if (fileName.slice(-6) == ".proto") {
                protoFileList.push({
                    dir: dir.replace(/\\/g, "/"),
                    fileName: fileName,
                });
            }
        }
    }
}


/**
 * 
 */
//
function runProtocCommand(command) {
    exec(command, {
        env: {
            PATH: 'C:\\Program Files\\Git\\bin'
        },
        shell: 'C:\\Program Files\\Git\\bin\\bash.exe'
    }, err => {
        if (err) {
            console.error(`throw exception ${err.toString()}`)
        }
        else {
            console.log(`command: ${command} success`)
        }
    })
}

/**
 * fetch proto file list
 */
fetchProtoFiles(protoFilesDir);

/**
 * construct protoc arguments
 */
const protocSourceArg = protoFileList.map(el => `--proto_path=${el.dir} ${el.fileName}`).join(' ')

//
let commandJava = `./protoc-3.17.3-win64/bin/protoc ${protocSourceArg} --java_out=${javaOutputDir}`
let commandJs = `./protoc-3.17.3-win64/bin/protoc ${protocSourceArg} --js_out=import_style=commonjs,binary:${jsOutputDir}`

/**
 * run protoc command
 */
delete process.platform;
process.platform = 'linux';

runProtocCommand(commandJava);
runProtocCommand(commandJs);

process.platform = 'win32';

