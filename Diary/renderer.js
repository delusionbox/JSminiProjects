let selectImagePaths = [];
let selectVideoPaths = [];

let editingDate = null;

//Submit and Show content event..
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', sendContents);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('ImageBtn').addEventListener('click', addImage);
    document.getElementById('VideoBtn').addEventListener('click', addVideo);
    document.getElementById('searchBtn').addEventListener('click', searchContents);
    document.getElementById('clearsearchBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearsearchBtn').style.display = 'none';
        showContents();
    });
    showContents();
});

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

function CreateImagePreview(path, editable = false) {
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.position = 'relative';

    const img = document.createElement('img');
    img.src = `file://${path}`;
    img.style.maxWidth = '100px';
    img.style.margin = '10px';

    container.appendChild(img);

    if (editable) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '0';
        removeBtn.style.right = '0';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';

        removeBtn.onclick = () => {
            container.remove();
            selectImagePaths = selectImagePaths.filter(p => p !== path);
        };

        container.appendChild(removeBtn);
    }
    return container;
};

function CreateVideoPreview(path, editable = false) {
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.position = 'relative';

    const video = document.createElement('video');
    video.src = `file://${path}`;
    video.controls = true;
    video.style.maxWidth = '100px';
    video.style.margin = '10px';
    container.appendChild(video);

    if (editable) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '0';
        removeBtn.style.right = '0';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';

        removeBtn.onclick = () => {
            container.remove();
            selectVideoPaths = selectVideoPaths.filter(p => p !== path);
        };


        container.appendChild(removeBtn);
    }
    return container;
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
            contentList.appendChild(CreateImagePreview(path, false));
        });

        (ctnt.videoPaths || []).forEach(path => {
            contentList.appendChild(CreateVideoPreview(path, false));
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
                document.getElementById('imagePreview').appendChild(CreateImagePreview(path, true));
            });
            document.getElementById('videoPreview').innerHTML = '';
            selectVideoPaths.forEach(path => {
                document.getElementById('videoPreview').appendChild(CreateVideoPreview(path, true));
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

async function searchContents() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    if (keyword === '') {
        alert("Input Search");
        return;
    };

    const allContents = await window.electronAPI.getContents();
    const filtered = allContents.filter(c =>
        (c.title && c.title.toLowerCase().includes(keyword)) || (c.content && c.content.toLowerCase().includes(keyword))
    );

    if (filtered.length === 0) {
        alert("Not exist");
    };

    renderFilteredContents(filtered);
    document.getElementById('clearsearchBtn').style.display = 'inline-block';
};

function renderFilteredContents(showList) {
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
            contentList.appendChild(CreateImagePreview(path, false));
        });

        (ctnt.videoPaths || []).forEach(path => {
            contentList.appendChild(CreateVideoPreview(path, false));
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
                document.getElementById('imagePreview').appendChild(CreateImagePreview(path, true));
            });
            document.getElementById('videoPreview').innerHTML = '';
            selectVideoPaths.forEach(path => {
                document.getElementById('videoPreview').appendChild(CreateVideoPreview(path, true));
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