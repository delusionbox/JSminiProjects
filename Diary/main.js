const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const fs = require('fs');
const { dialog } = require('electron/main');

const DATA_PATH = path.join(__dirname, 'data.json');
const UPLOAD_PATH = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH);
};

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
    win.webContents.openDevTools();
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
        imagePaths: contents.imagePaths || [],
        videoPaths: contents.videoPaths || [],
    }); //else content push in empty array
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); //and write json (value, replacer, space)
});

ipcMain.handle('show-contents', async () => {
    if (fs.existsSync(DATA_PATH)) { //file exist return data..
        const data = JSON.parse(fs.readFileSync(DATA_PATH));
        return data;
    } else {
        return [];
    };
});

ipcMain.handle('select-image', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Image',
            extensions: ['jpg', 'png', 'gif']
        }]
    });

    if (result.canceled || result.filePaths.length == 0) {
        return null;
    };

    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const destPath = path.join(UPLOAD_PATH, fileName);

    fs.copyFileSync(sourcePath, destPath);

    return destPath;
});

ipcMain.handle('select-video', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Video',
            extensions: ['avi', 'mp4', 'mov']
        }]
    });

    if (result.canceled || result.filePaths.length == 0) {
        return null;
    };

    const sourcePath = result.filePaths[0];
    const fileName = path.basename(sourcePath);
    const destPath = path.join(UPLOAD_PATH, fileName);

    fs.copyFileSync(sourcePath, destPath);

    return destPath;
});

ipcMain.handle('edit-contents', (event, index, newData) => {
    if (fs.existsSync(DATA_PATH)) {
        const data = JSON.parse(fs.readFileSync(DATA_PATH));
        if (index >= 0 && index < data.length) {
            data[index] = newData;
            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        };
    };
});