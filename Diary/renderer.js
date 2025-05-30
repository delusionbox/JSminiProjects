function sendContents() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = Date.now();

    const submitData = { title, content, date };

    window.electronAPI.sendContents(submitData);
    alert("Submit Success!");
}; //Contents Submit function