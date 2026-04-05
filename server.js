const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const SECRET = "supersecretkey";

app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const db = new sqlite3.Database("./database.db");

//makes three tables in database.
//one for user info, one for tokens and another for uploaded files.
db.serialize(()=>{

    db.run(`
        CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS tokens(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS files(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner TEXT,
        filename TEXT,
        filepath TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        size INTEGER
        )`);
});


//multer config 
const storage = multer.diskStorage({
    destination: function(req,file,cb){
    cb(null,"uploads/");
    },

    filename: function(req,file,cb){

        const customName = req.body.filename;
        const extension = path.extname(file.originalname);
        cb(null, customName + extension);
    }
});

const upload = multer({storage:storage});
//end of multer config


function authenticateToken(req,res,next) {

    const authHeader = req.headers["authorization"];

    if(!authHeader) {
        return res.status(401).json({message:"Token missing."});
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token,SECRET,(err,user)=>{

        if(err) {
            return res.status(403).json({message:"Invalid or expired token."});
        }

        req.user = user;
        next();
    });
}

app.post("/register", async(req,res) => {

    const {username,password}=req.body;
    const hash = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users(username,password) VALUES (?,?)",
        [username,hash],
        function(err) {

            if(err){
                return res.status(400).json({message:"User already exists."});
            }

            res.json({message:"Registered successfully."});
        });
});

app.post("/login",(req,res)=> {

    const {username,password}=req.body;

    db.get(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err,user)=> {

            if(!user) {
                return res.status(400).json({message:"Invalid username."});
            }

            const valid = await bcrypt.compare(password, user.password);

            if(!valid) {
                return res.status(400).json({message:"Invalid Password."});
            }

            const token = jwt.sign( 
                {userId:user.id,username:user.username},
                SECRET,
                {expiresIn:"5m"}
            );

            db.run(
                "INSERT INTO tokens(user_id,token) VALUES (?,?)",
                [user.id,token]
            );

            res.json({token:token});
        });
});

//access to all private html pages. 
app.get("/downloads",(req,res)=> {
    
    res.sendFile(path.join(__dirname,"private","downloads.html"));
});

app.get("/myfiles",(req,res)=> {
    
    res.sendFile(path.join(__dirname,"private","myfiles.html"));
});

app.get("/upload",(req,res)=> {
    
    res.sendFile(path.join(__dirname,"private","upload.html"));
});


//backend methods that use authenticateToken function to check token for each private page.
app.get("/api/upload-auth",authenticateToken,(req,res)=> {

    res.json({message:"Welcome to the upload page!",
    user:req.user.username
    });
});

app.get("/api/downloads-auth", authenticateToken, (req, res) => {

    res.json({message: "Welcome to the downloads page!",
    user:req.user.username 
    });
});

app.get("/api/myfiles-auth", authenticateToken, (req, res) => {

    res.json({message: "Welcome to the myfiles page!",
    user:req.user.username 
    });
});


//backend for upload page
//inserts uploaded image and relevant info into files table. 
app.post("/uploaded",upload.single("file"),(req,res)=>{

    const owner = req.body.owner;
    const filename = req.body.filename;
    const filepath = req.file.filename;
    const size = req.file.size;

    const sql = 
    "INSERT INTO files(owner,filename,filepath,size) VALUES (?,?,?,?)";

    db.run(sql,[owner,filename,filepath, size],function(err){

        if(err) {
            return res.status(500).json({message:"Database Error."});
        }

        res.json({message:"File uploaded."});
    });
});


//backend for downloads page. 
//retrieves all files saved to database and displays them. 
app.get("/files", authenticateToken,(req,res)=> {

    db.all("SELECT * FROM files",(err,rows)=>{

        if(err) {
            return res.status(500).json({message:"Database Error."});
        }

        res.json(rows);
    });
});


//backend for myfiles page. 
//gets username from token and finds all files in database whose owner matches the username. 
app.get("/api/myfiles-data", authenticateToken, (req,res)=> {

    const owner = req.user.username;
    const sql = 
    "SELECT * FROM files WHERE owner=?";

    db.all(sql, [owner], (err, rows)=>{

        if(err) {
            return res.status(500).json({message:"Database error"});
        }
        
        res.json(rows);
    });
});


//additional backend for myfiles page.
//deletes file from dynamically loaded list using file id.
app.delete("/api/delete-file/:id", authenticateToken, (req, res) => {

    const id = req.params.id;
    const username = req.user.username;

    db.get("SELECT owner FROM files WHERE id=?", [id], function(err, row) {

        if(err) {
            return res.status(500).json({message:"Database error."});
        }

        //compares username using token to file owner so user can only delete their own files. 
        if(row.owner !== username) {
            return res.status(403).json({message:"You are unauthorized to delete file."});
        }

        db.run("DELETE FROM files WHERE id=?", [id], (err)=> {

            if(err) {
                return res.status(500).json({message:"Database error."});
            }

            res.json({message:"File deleted."});
        });
    });
});


app.listen(3000,()=> {
    console.log("Server running on http://localhost:3000");
});