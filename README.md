<h1>Node.js Express File Upload App</h1>

<h2>Project Description</h2>
<p>This application allows a user to register and log in using a username and password. 
They can then navigate to different pages where they can upload files, delete their own files, 
see lists of their uploaded files and of files uploaded from all users.</p>

<h2>Prerequisites</h2>
<ul>
  <li>VS Code (or any other code editor)</li>
  <li>Node.js (project written on v.24.13.0)</li>
  <li>npm (built into Node.js)</li>
  <li>Git (should you wish to clone repository)</li>
</ul>

<h2>Steps to Install and Open</h2>

<h3>1. Clone repository.</h3>
<ul>
  <li>Open Git Bash in Windows Search.</li>
  <li>Enter the following commands: git clone https://github.com/nsg4/final-project.git</li>
  <li>cd final-project</li>
</ul>

<h3>2. Install Dependencies</h3>
<ul>
  <li>In Git Bash, enter the following commands: npm install</li>
  <li>node server.js</li>
</ul>

<h3>3. Open Application in Browser.</h3>
<ul>
  <li>Enter the following into your browser address bar: http://localhost:3000/index</li>
  <li>You will be directed to a home page where you can click on links to register and then log in.</li>
</ul>

<h2>All API Endpoints</h2>

<h3>Public (can be accessed without registering or logging in):</h3>
<ul>
  <li>/index   ---   Application home page.</li>
  <li>/register   ---   Register account page.</li>
  <li>/login   ---   Log In page.</li>
</ul>

<h3>Private (can only be accessed after registering an account and logging in):</h3>
<ul>
  <li>/upload   ---   Loads image upload page.</li>
  <li>/myfiles   ---   Loads page listing user's uploads.</li>
  <li>/downloads   ---   Loads page listing all user uploads.</li>
  <li>/api/upload-auth   ---   Checks token on upload page.</li>
  <li>/api/downloads-auth   ---   Checks token on downloads page.</li>
  <li>/api/myfiles-auth   ---   Checks token on myfiles page.</li>
  <li>/uploaded   ---   Uploads file to server/database.</li>
  <li>/files   ---   Gets all uploads from database.</li>
  <li>/api/myfiles-data   ---   Gets uploads from logged in user.</li>
  <li>/api/delete-file/:id   ---   Deletes logged in user's file.</li>
</ul>

<h2>Additional Note</h2>
<p>Upon initial git repo cloning and installing dependencies, if you wish to open the project again you can do the following:</p>
<ol>
  <li>Find the repository in your file system and open it in a code editor like VS Code.</li>
  <li>Open a new terminal in VS Code and type the following command: node server.je</li>
  <li>click on the http://localhost:3000 link provided to open the project in the browser.</li>
</ol>


