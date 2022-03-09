const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const http = require('http');
const path = require("path");
const bodyParser = require('body-parser')
const helmet = require('helmet')
const rateLimit = require("express-rate-limit");

//const helmet = require('helmet');
//const rateLimit = require("express-rate-limit");

//PORTS
var app = express();
var PORT = 3000;

//CREATE SERVER
var server = http.createServer(app);

const limiter = rateLimit({
    winowMs: 15 * 60 * 1000, max: 100
});

//sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);

//set up DB
let db = new sqlite3.Database('tab');
db.run('CREATE TABLE IF NOT EXISTS tab(id TEXT,name TEXT)');


//ROUTES
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./public/form.html'));
});


// Add
app.post("/add", function (req, res) {
    db.serialize(() => {
      db.run(
          "INSERT INTO tab(id,name) VALUES(?,?)",
          [req.body.id, req.body.name],
          function (err) {
              if (err) {
                  return console.log(err.message);
                }
                console.log("New employee has been added");
                res.send(
                    "New employee has been added into the database with ID = " +
              req.body.id +
              " and Name = " +
              req.body.name
              );
            }
            );
        });
    });
    
    //view
    app.post('/view', function(req,res){
        db.serialize(()=>{
            db.each('SELECT id , name NAME FROM tab WHERE id =?',[req.body.id],function(err,row){
                if (err){
                    res.send("ERROR encouterd while displaying");
                    return console.error(err.message);
                }
                res.send(` ID:  ${row.ID},    Name: ${row.NAME}`);
                console.log("ENTRY deslayed sucsesfull")
            });
        });
    });
    
    //update
    app.post('/update', function(req,res){
        db.serialize(()=>{
            db.run('UPDATE tab SET name = ? WHERE id = ?', [req.body.name,req.body.id],
            function(err){
                if(err){
                    res.send("Error encounteered while updating");
                    return console.error(err.message);
                }
                res.send("Entry updated successfully");
                console.log("Entry updated sucessfully");
            });
        });
    });
   
    //delete
    app.post('/delete', function(req,res){
        db.serialize(()=>{
            db.run('DELETE FROM tab WHERE id = ?', req.body.id,
            function(err){
                if(err){
                    res.send("Error encounteered while deleting");
                    return console.error(err.message);
                }
                res.send("Deleted successfully");
                console.log("Deleted sucessfully");
            });
        });
    });

    //closing database connection
    app.get('/close', function(req,res){
        db.close((err) =>{
            if(err) {
                res.send('There is some error in closing the database');
                return console.error(err.message);
            }
            console.log('Closing the database connection');
            res.send('Database connection successfully closed');
        });
    });

    

    server.listen(3000 , function(){
        console.log("server is listening on port " + PORT);
    });
  
  
  
  
  