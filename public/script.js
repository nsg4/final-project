//javascript for register page.
const API = "http://localhost:3000";

async function register() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API+"/register", {

        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,password})
    });

    const data = await res.json();

    alert(data.message);
}

//js for login page.
async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API+"/login", {

        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username,password}) 
    });

    const data = await res.json();

    if(data.token) {
        localStorage.setItem("token",data.token);

        window.location="/upload";

    } else {
        //unsure if I'm dealing with this alert correctly. 
        alert("The token is empty or undefined.");
    }
}

//Called as soon as upload page loads. Checks token because upload is a protected route. 
async function loadUpload() {

    const token = localStorage.getItem("token");

    if(!token) {
        alert("Please log in first.");
        window.location="login.html";
        return;
    }

    const res = await fetch(API+"/api/upload-auth", {

        headers:{Authorization:"Bearer "+token}

    });

    if(res.status!==200) {
        alert("Session Expired.");
        localStorage.removeItem("token");
        window.location="login.html";
        return;
    }

    const data = await res.json();
    //data sent from backend not needed for this page. 
    console.log(data);
}


//called as soon as downloads page loads. checks token. 
async function loadDownloads() {

    const token = localStorage.getItem("token");

    if(!token) {
        alert("Please log in first.");
        window.location="login.html";
        return;
    }

    const res = await fetch(API+"/api/downloads-auth", {

        headers:{Authorization:"Bearer "+token}

    });

    if(res.status!==200) {
        alert("Session Expired.");
        localStorage.removeItem("token");
        window.location="login.html";
        return;
    }

    const data = await res.json();
    console.log(data);
}

//called as soon as myfiles page loads. Checks token. 
async function loadMyFiles() {

    const token = localStorage.getItem("token");

    if(!token) {
        alert("Please log in first.");
        window.location="login.html";
        return;
    }

    const res = await fetch(API+"/api/myfiles-auth", {

        headers:{Authorization:"Bearer "+token}

    });

    if(res.status!==200) {
        alert("Session Expired.");
        localStorage.removeItem("token");
        window.location="login.html";
        return;
    }

    const data = await res.json();
    console.log(data);
}

//logout function. Called when log out button is clicked.
//removes token from local storage and redirects to login page.
function logout() {

    localStorage.removeItem("token");
    window.location="login.html";
}


//javascript for everything on upload page
const form = document.getElementById("uploadForm");
const fileList = document.getElementById("fileList");
const myFileList = document.getElementById("myFileList");

//sends file uploaded by user to backend.
if(form) {
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const owner = document.getElementById("owner").value;
        let filename = document.getElementById("filename").value;

        //NOTE: struggled to implement sanitization/file limits in the backend. 
        //page kept crashing so I've just implemented alerts in frontend. Hope that's enough.
        //santizes file name input from user. Removes everything but letters,numbers, underscores and dashes.
        filename = filename.replace(/[^a-zA-Z0-9_-]/g, "");
        const file = document.getElementById("file").files[0];

            //checks if user has uploaded a file when submitting.
            //if so, alerts user if file type or size is wrong. 
            if(file) {
                const allowed = ["application/pdf", "video/mp4"];

                if(!allowed.includes(file.type)) {
                    alert("Wrong file type. Only MP4 and PDF are permitted.");
                    return;
                }

                if(file.size > 20 * 1024 * 1024) {
                    alert("File must be less than 20MB.");
                    return;
                }
            }

        const formData = new FormData();

        formData.append("owner", owner);
        formData.append("filename", filename);
        formData.append("file", file);

        await fetch("/uploaded", {

            method: "POST",
            body:formData

        });

        alert("File uploaded.");
        form.reset();
    });
}


//loads all uploaded files onto downloads page. 
//checks token again because /files is separate protected route. 
async function loadFiles() {

    const token = localStorage.getItem("token");

        if (!token) {
            alert("Please log in first.");
            window.location = "login.html";
            return;
        }

        const res = await fetch("/files", {

            headers: {Authorization: "Bearer " + token}
        });

        if (res.status !== 200) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location = "login.html";
            return;
        }

        const files = await res.json();
        displayFiles(files);
}


//function is passed all files collected from database.
// displays them in a dynamic list on downloads page. 
function displayFiles(files) {
    fileList.innerHTML = "";
    files.forEach(file=> {
        const li = document.createElement("li");

        li.innerHTML = 
        " | <b>Name: </b>" + file.filename + 
        " | <b>Owner: </b>" + file.owner + 
        " | <b>Time: </b>" + file.timestamp + 

        //displays file size
        " | <b>Size: </b>" + file.size + 
        ` | <a href="/uploads/${file.filepath}" target="_blank">Open</a>`; 

        fileList.appendChild(li);
    });
}


//called upon pressing load my files button. Loads user's files to myfiles page.
//checks for token again because /api/myfiles-data is a separate route. 
async function loadMine() {
    
    const token = localStorage.getItem("token");

        if (!token) {
            alert("Please log in first.");
            window.location = "login.html";
            return;
        }

        const res = await fetch("/api/myfiles-data", {

            headers: {Authorization: "Bearer " + token}
        });

        if (res.status !== 200) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location = "login.html";
            return;
        }

        const files = await res.json();
        displayMine(files);
}


//data collected from database is displayed in a dynamic list on myfiles page.
async function displayMine(files) {

    myFileList.innerHTML = "";
    files.forEach(file=> {
        const li = document.createElement("li");

        li.innerHTML = 
        " | <b>Name: </b>" + file.filename + 
        " | <b>Owner: </b>" + file.owner + 
        " | <b>Time: </b>" + file.timestamp +
        ` | <a href="/uploads/${file.filepath}" target="_blank">Open</a>` +

        //dynamically adds delete button that calls a delete function.
        ` | <button onclick="deleteFiles(${file.id})">Delete</button>`;

        myFileList.appendChild(li);
    });
}

//function called when clicking delete button. 
// Deletes file from database and removes it from list.
//struggled to implement deleting files from /uploads folder. No idea what to do.
async function deleteFiles(id) {

    const token = localStorage.getItem("token");

    if(!token) {
        alert("Please log in first.");
        window.location = "login.html";
        return;
    }

    const res = await fetch(`/api/delete-file/${id}`, {
        
        method: "DELETE",
        headers: {Authorization: "Bearer " + token}
    });

    const data = await res.json();

    if(res.status === 200) {
        alert(data.message);
        loadMine();
    }

    else {
        alert(data.message);
    }
}
