
let selectImagePaths = [];
let selectVideoPaths = [];

let editingIndex = null;

//Submit and Show content event..
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', sendContents);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('ImageBtn').addEventListener('click', addImage);
    document.getElementById('VideoBtn').addEventListener('click', addVideo);
    showContents();
});

function cancelEdit() {
    editingIndex = null;
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('submitBtn').innerText = 'Save';
    document.getElementById('cancelEditBtn').style.display = 'none';
    selectImagePaths = [];
    selectVideoPaths = [];
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('videoPreview').innerHTML = '';
}

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

    if (editingIndex !== null) {
        window.electronAPI.editContents(editingIndex, submitData);
        alert("Edit Success!");
        document.getElementById('submitBtn').innerText = 'Save';
        editingIndex = null;
    } else {
        window.electronAPI.sendContents(submitData);
        alert("Submit Success!");
    };

    editingIndex = null;
    selectImagePaths = [];
    document.getElementById('imagePreview').innerHTML = '';
    selectVideoPaths = [];
    document.getElementById('videoPreview').innerHTML = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('submitBtn').innerText = 'Save';
    document.getElementById('cancelEditBtn').style.display = 'none';

    showContents();
    //window.location.reload();
};


//Show Content function
//date part needs improvement.. 
async function showContents() {
    const showList = await window.electronAPI.getContents();
    const list = document.getElementById('contentList');
    list.innerHTML = '';

    showList.forEach((ctnt, index) => {
        const contentList = document.createElement('div');
        contentList.className = "show-list";
        contentList.innerHTML = `
            <h1>${ctnt.date} = ${ctnt.title}</h1> 
            <p>${ctnt.content}</p>
            <button class="editBtn">Edit</button>
        `;

        //image and video
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

        //editing 
        contentList.querySelector('.editBtn').addEventListener('click', () => {
            editingIndex = index;
            document.getElementById('title').value = ctnt.title;
            document.getElementById('content').value = ctnt.content;
            selectImagePaths = ctnt.imagePaths || [];
            selectVideoPaths = ctnt.videoPaths || [];

            document.getElementById('submitBtn').innerText = "Edit";
            document.getElementById('cancelEditBtn').style.display = 'inline-block';

            //preview update
            document.getElementById('imagePreview').innerHTML = '';
            selectImagePaths.forEach(path => {
                const img = document.createElement('img');
                img.src = `file://${path}`;
                img.style.maxWidth = '100px';
                img.style.margin = '10px';
                document.getElementById('imagePreview').appendChild(img);
            });
            document.getElementById('videoPreview').innerHTML = '';
            selectImagePaths.forEach(path => {
                const video = document.createElement('video');
                video.src = `file://${path}`;
                video.style.maxWidth = '100px';
                video.style.margin = '10px';
                document.getElementById('imagePreview').appendChild(video);
            });
        });

        list.appendChild(contentList);
    });
};


/* Don't Use.. DOMContentLoaded is better
window.onload = () => {
    showContents();
}
*/