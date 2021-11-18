const path = require('path');
const url = require('url');
const {app, BrowserWindow, ipcMain} = require('electron');
const http = require("http");
const fs = require("fs");
const cp = require("child_process");
const AdmZip = require('adm-zip');


let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: __dirname + '/img/logo.png',
        //title: config.settings.name,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname + '/UI/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //win.loadURL('http://localhost:3000');

    //win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    })
}

ipcMain.on('window:minimize', () => {
    win.minimize();
})

ipcMain.on('window:reload', () => {
    win.reload();
})

ipcMain.on('game:btnPlay', (res, data) => {
    fs.stat('ALT', (err) => {
        if (!err) {
            fs.stat('ALT/altv.exe', (error) => {
                if (!error) {
                    cp.exec(`cd ALT && altv.exe -connecturl altv://connect/${data.ip}:${data.port}`);
                }
            })
        } else {
            fs.mkdirSync('ALT');
            install()
            setTimeout(() => {
                cp.exec(`cd ALT && altv.exe -connecturl altv://connect/${data.ip}:${data.port}`);
            }, 15000)
        }
    })
})

async function install () {
        http.get('http://cdn.altv.mp/altv-release.zip', (res) => {
            res.pipe(fs.createWriteStream('alt.zip'));
        })
        try {
            await setTimeout(() => {
                var zip = new AdmZip('./alt.zip');
                zip.extractAllTo('./ALT', true);
                setTimeout(() => {
                    fs.unlink('alt.zip', (err) => {
                        console.log('alt.zip deleted')
                    })
                }, 5000)
            }, 5000)
        } catch (err) {
            console.log(err)
        }
}

const isLaunched = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
        default: break;
    }
    cp.exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

ipcMain.on('game:isLaunched', () => {
    isLaunched('GTA5.exe', (response) => {
        return response;
    })
})

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});

