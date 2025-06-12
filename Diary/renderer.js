let selectImagePaths = [];
let selectVideoPaths = [];

let editingDate = null;

//Submit and Show content event..
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', sendContents);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('ImageBtn').addEventListener('click', addImage);
    document.getElementById('VideoBtn').addEventListener('click', addVideo);
    showContents();
});

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

function CreateImagePreview(path) {
    const img = document.createElement('img');
    img.src = `file://${path}`;
    img.style.maxWidth = '100px';
    img.style.margin = '10px';
    return img;
};

function CreateVideoPreview(path) {
    const video = document.createElement('video');
    video.src = `file://${path}`;
    video.controls = true;
    video.style.maxWidth = '100px';
    video.style.margin = '10px';
    return video;

};

function cancelEdit() {
    editingDate = null;
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
    if (imagePath && !selectImagePaths.includes(imagePath)) {
        selectImagePaths.push(imagePath);
        document.getElementById('imagePreview').appendChild(CreateImagePreview(imagePath));
    };
};

async function addVideo() {
    const videoPath = await window.electronAPI.selectVideo();
    if (videoPath && !selectVideoPaths.includes(videoPath)) {
        selectVideoPaths.push(videoPath);
        document.getElementById('videoPreview').appendChild(CreateVideoPreview(videoPath));
    };
};


//Contents Submit function
async function sendContents() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = editingDate ?? Date.now();

    const submitData = { title, content, date, imagePaths: selectImagePaths, videoPaths: selectVideoPaths, };

    if (editingDate !== null) {
        await window.electronAPI.editContents(editingDate, submitData);
    } else {
        await window.electronAPI.sendContents(submitData);
        alert("Submit Success!");
    };

    cancelEdit();
    showContents();
    //window.location.reload();
};


//Show Content function
//date part needs improvement.. 
async function showContents() {
    const showList = await window.electronAPI.getContents();
    const list = document.getElementById('contentList');
    list.innerHTML = '';

    showList.forEach((ctnt) => {
        const contentList = document.createElement('div');
        contentList.className = "show-list";
        contentList.innerHTML = `
            <h1>${ctnt.date} = ${ctnt.title}</h1> 
            <p>${ctnt.content}</p>
            <button class="editBtn">Edit</button>
        `;

        //image and video
        (ctnt.imagePaths || []).forEach(path => {
            contentList.appendChild(CreateImagePreview(path));
        });

        (ctnt.videoPaths || []).forEach(path => {
            contentList.appendChild(CreateVideoPreview(path));
        });

        //editing 
        contentList.querySelector('.editBtn').addEventListener('click', () => {
            editingDate = ctnt.date;
            document.getElementById('title').value = ctnt.title;
            document.getElementById('content').value = ctnt.content;
            selectImagePaths = [...ctnt.imagePaths || []];
            selectVideoPaths = [...ctnt.videoPaths || []];

            document.getElementById('submitBtn').innerText = "Edit";
            document.getElementById('cancelEditBtn').style.display = 'inline-block';

            //preview update
            document.getElementById('imagePreview').innerHTML = '';
            selectImagePaths.forEach(path => {
                document.getElementById('imagePreview').appendChild(CreateImagePreview(path));
            });
            document.getElementById('videoPreview').innerHTML = '';
            selectVideoPaths.forEach(path => {
                document.getElementById('videoPreview').appendChild(CreateVideoPreview(path));
            });
        });

        //delete
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.onclick = async () => {
            const confirmed = confirm("Are you Sure?");
            if (confirmed) {
                await window.electronAPI.deleteContent(ctnt.date);
                alert("Del Complete");
                showContents();
            }
        };
        contentList.appendChild(deleteBtn);

        list.appendChild(contentList);
    });
};


/* Don't Use.. DOMContentLoaded is better
window.onload = () => {
    showContents();
}
*/