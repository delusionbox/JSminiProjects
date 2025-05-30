const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(__dirname, 'data.json');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, 
            nodeIntegration: false,
        }
    });

    win.loadFile('index.html');
};

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('submitContents', (event, contents) => { //Content write in JSON file
    let data = []; //empty array
    if (fs.existsSync(DATA_PATH)) { //if data.json is exist
        data = JSON.parse(fs.readFileSync(DATA_PATH)); //read json file
    }
    data.push({
        title: contents.title,
        content: contents.content,
        date: contents.date,
    }); //else content push in empty array
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); //and write json (value, replacer, space)
});