const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var exec = require('child_process').exec;
	
const sqlite3 = require('sqlite3').verbose();


// open database in memory
let db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});
 
var scheduler_exec;

var memoryStore = [];

var id = 0;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/results', express.static(__dirname + '/results'));


app.get('/status', function (req, res) {
  res.json({"status" : "connected"});
})

app.post('/status', function (req, res) {
  let s = req.body.status;
  
	switch (s) {
	  case 'start':
		console.log("starting scheduler");
		scheduler_exec = exec('node ./scheduler.js', function(error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ', error);
			}
		});
		break;
	  case 'kill':
		console.log("killing scheduler");
		scheduler_exec.kill('SIGTERM');
		break;
	  case 'clear':
		break;
	  default:
		console.log('command not defined');
	}
	res.send();
})

app.get('/links', function (req, res) {

})

app.get('/link/:taskId', function (req, res) {
	// verify that task is done and send it
	db.get('SELECT file FROM tasks WHERE id = ?', req.params.taskId, function(err, rows) {
		if (err) {
		  console.log("[DB] Error getting tasks");
		  res.json({"status": "error"});
		} else {
		  if(row){
			  res.download(row.file);
		  }
		}
		
	});
})

app.delete('/tasks/:taskId', function (req, res) {
})

app.get('/tasks', async (req, res) => {
	db.all('SELECT * FROM tasks', function(err, rows) {
		if (err) {
		  console.log("[DB] Error getting tasks");
		  res.json({"status": "error"});
		} else {
			res.json(rows);
		}
		
	});
})

app.get('/log/:taskId', function (req, res) {
  //res.send('Server status');
})

app.get('/queue', async (req, res) => {
	db.all('SELECT * FROM tasks WHERE status = 0', function(err, rows) {
		if (err) {
		  console.log("[DB] Error getting queue");
		  res.json({"status": "error"});
		} else {
			res.json(rows);
		}
		
	});
})

app.post('/task', async (req, res) => {
	console.dir(req.body);
	memoryStore.push({"url" : req.body.url, "id": id});
	// status == 0 is "pending"
	db.run('INSERT INTO tasks(url, status) VALUES(?, ?)', [req.body.url, 0], function(err) {
		if (err) {
		  console.log("db err");
		  res.json({"status": "error"});
		} else {
			r = "ok";
			res.json({"status": "ok", "id": id});
		}
		
	});
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



