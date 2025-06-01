//Submit and Show content event..
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitBtn').addEventListener('click', sendContents);
    showContents();
});


//Contents Submit function
function sendContents() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const date = Date.now();

    const submitData = { title, content, date };

    window.electronAPI.sendContents(submitData);
    alert("Submit Success!");
    window.location.reload();
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
        list.appendChild(contentList);
    });
};


/* Don't Use.. DOMContentLoaded is better
window.onload = () => {
    showContents();
}
*/