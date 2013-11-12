var root_directory = {};

var file_name_aruco = "aruco.txt";

function discoverFileSystem(){
	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/file"), {
		onFound: function (service) {
			if(service.serviceAddress === webinos.session.getPZPId()){
				service.bindService({
					onBind: function () {
						service.requestFileSystem(1, 1024, 
							function (filesystem) {
								root_directory = filesystem.root;
       							load_file(file_name_aruco);
							},
							function (error) {
								alert("Error requesting filesystem (#" + error.code + ")");
							}
						);					
					}
				});
			}
		}
	});
}

function save_file(data, file_name){
	root_directory.getFile(file_name, {create: true, exclusive: false}, 
		function (entry) {
			entry.createWriter(
				function (writer) {
					var written = false;
					writer.onerror = function (evt) {
						alert("Error writing file (#" + evt.target.error.name + ")");
					}

					writer.onwrite = function (evt) {
                        if (!written) {
                            written = true;
                            writer.write(new Blob([JSON.stringify(data)]));
                    	}
                    }
                    

                    writer.truncate(0);
				}, 
				function (error){
					alert("Error retrieving file writer (#" + error.name + ")");
				}
			);
		},
		function (error) {
			alert(error.message);
		}
	);
}


function load_file(file_name){
    root_directory.getFile(file_name, {create: false, exclusive: false}, 
		function (myentry) {
			var r = new window.FileReader();
			r.onerror = function (evt) {
				alert("Error reading file (#" + evt.target.error.name + ")");
			}

			r.onload = function (evt) {
				try{
					idObject_to_identify = JSON.parse(evt.target.result);

					//load sensors and actuators
					discoverActuators();
					discoverSensors();
				}
				catch(err){
					//alert(err.message);
				}
			}

			myentry.file(function (fileR) {
				r.readAsText(fileR);
			}, function (error) {
				alert("Error retrieving file (#" + error.name + ")");
			});
		},
		function (error) {
			//if the file data.txt doesn't exist load the default upload image and center it
			//alert("Error on read file");
			
			//load sensors and actuators
			discoverActuators();
			discoverSensors();
		}
	);
}