const fs = require('fs');
const child_process = require('child_process');

exports.CROCOITE_BIN_PATH = "/home/ec2-user/crocoite/sandbox/bin";
exports.DATA_PATH = "./results/"

exports.process_task = function(url, id){
	const t_url = new URL(url);
	var file = t_url.hostname + Date.now() + '.warc.gz';
	var output = child_process.execFileSync(this.CROCOITE_BIN_PATH + "/crocoite-grab", [url, this.DATA_PATH + file], [], function(error, stdout, stderr){
		if(error){
			console.log(error);
			return ({"error": error});
		}
	
	});
	
	return ({"id": id, "file": file, "output": output.toString()});
}
