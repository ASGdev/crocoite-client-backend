const worker = require("./worker.js");
const sqlite3 = require('sqlite3').verbose();
const child_process = require("child_process");

var db = new sqlite3.Database('./tasks.db', (err) => {
	  if (err) {
			return console.error(err.message);
	  }
	  console.log('Worker connected to the SQlite database.');
	  doLoop();
	});


function doLoop(){
	console.log("Starting worker loop...");

		// get first pending task
		db.get('SELECT * FROM tasks WHERE status = 0', [], (err, row) => {
			if(err){
				console.log("Error getting new tasks");
				console.log(err.message);
				wait();
			} else {
				if(row){
					console.log("Processing new task : ");
					console.log("- id : " + row.id);
					console.log("- url : " + row.url);
					
					// update db
					db.run('UPDATE tasks SET status = 1 WHERE id = ?', [row.id], function(err){
					  if(err){
							return console.error(err.message);
					  } else {
							console.log("Processing task...");
							// process it
							var r = worker.process_task(row.url, row.id);
							
							// update db
							db.run('UPDATE tasks SET status = 2, file = ?, output = ? WHERE id = ?', [r.file, r.output, row.id], function(err){
								if(err){
									return console.error(err.message);
								} else {		
									// ok
									wait();
								}
							});						
					  }
					});

				} else {
					console.info("No more task to process... sleeping 5 seconds");
					wait();
				}
			}
		});
	
}

function wait(){
	child_process.execSync("sleep 5");
	doLoop();
}


process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Stopping worker...');
  db.close();
});

