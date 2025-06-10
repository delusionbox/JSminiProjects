
let selectImagePaths = [];
let selectVideoPaths = [];

//Submit and Show content event..
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', sendContents);
    document.getElementById('ImageBtn').addEventListener('click', addImage);
    document.getElementById('VideoBtn').addEventListener('click', addVideo);
    showContents();
});

//add Image and Video
async function addImage() {
    const imagePath = await window.electronAPI.selectImage();
    if (imagePath) {
        selectImagePaths.push(imagePath);

        const imagePre = document.createElement('img');
        imagePre.src = imagePath;
        imagePre.style.maxWidth = '100px';
        imagePre.style.margin = '10px';
        document.getElementById('imagePreview').appendChild(imagePre);
    };
};

async function addVideo() {
    const videoPath = await window.electronAPI.selectVideo();
    if (videoPath) {
        selectVideoPaths.push(videoPath);

        const videoPre = document.createElement('video');
        videoPre.src = videoPath;
        videoPre.style.maxWidth = '100px';
        videoPre.style.margin = '10px';
        document.getElementById('videoPreview').appendChild(videoPre);
    };
};


//Contents Submit function
function sendContents() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = Date.now();

    const submitData = { title, content, date, imagePaths: selectImagePaths, videoPaths: selectVideoPaths, };

    window.electronAPI.sendContents(submitData);
    alert("Submit Success!");

    selectImagePaths = [];
    document.getElementById('imagePreview').innerHTML = '';
    selectVideoPaths = [];
    document.getElementById('videoPreview').innerHTML = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';

    showContents();
    //window.location.reload();
};


//Show Content function
//date part needs improvement.. 
async function showContents() {
    const showList = await window.electronAPI.getContents();
    const list = document.getElementById('contentList');
    list.innerHTML = '';

    showList.forEach(ctnt => {
        const contentList = document.createElement('div');
        contentList.className = "show-list";
        contentList.innerHTML = `
            <h1>${ctnt.date} = ${ctnt.title}</h1> 
            <p>${ctnt.content}</p>
        `;

        if (ctnt.imagePaths && ctnt.imagePaths.length > 0) {
            ctnt.imagePaths.forEach(imgPath => {
                const img = document.createElement('img');
                img.src = `file://${imgPath}`;
                img.style.maxWidth = '100px';
                img.style.margin = '10px';
                contentList.appendChild(img);
            });
        };

        if (ctnt.videoPaths && ctnt.videoPaths.length > 0) {
            ctnt.videoPaths.forEach(vidPath => {
                const video = document.createElement('video');
                video.src = `file://${vidPath}`;
                video.controls = true;
                video.style.maxWidth = '300px';
                video.style.margin = '10px';
                contentList.appendChild(video);
            });
        };

        list.appendChild(contentList);
    });
};


/* Don't Use.. DOMContentLoaded is better
window.onload = () => {
    showContents();
}
*/