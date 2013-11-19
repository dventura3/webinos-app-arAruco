var sensorServices = [];
var actuatorServices = [];
var sensor_types = "http://webinos.org/api/sensors/*";
var actuator_types = "http://webinos.org/api/actuators/*";
var idObject_to_identify = {};

var sensor = {};
var actuator = {};
var registered = false;
var toFind = true;
var toRemoveFromFile = false;

var operations = {
	"ADD" : false,
	"REMOVE" : true
}

//necessary for graph google component
google.load("visualization", "1", {packages:["corechart"]});

//onLoad is the ready function!
$(document).ready(onLoad);

//graphic to show on display
var graphic;

//actuator component to show on display
var actComponent;


var eventListenerFunction = function(event){	
	if(graphic.type == "thermometer"){
		graphic.setVal(event.sensorValues[0]);
		$("#content_chart").show();
	}else if(graphic.type == "line-chart"){
		var time=new Date(event.timestamp);
		time=(time.getUTCHours()+2)+ ":"+time.getUTCMinutes()+":"+time.getUTCSeconds();

		var arrayTMP = new Array();
		arrayTMP[0] = time;
		arrayTMP[1] = parseInt(event.sensorValues[0]);

		var dimGraphData = graphic.graphData.addRow(arrayTMP);

		graphic.numberOfValues++;
  		graphic.chart.draw(graphic.graphData, graphic.options);
		if(graphic.numberOfValues>150){
			graphic.graphData.removeRow(0);
		}
		$("#content_chart").show();	
	}else{
		console.log("Error!");
	}
	$("#values").text(event.sensorValues[0]);			
};


var video, canvas, context, imageData, detector;
  
function onLoad(){
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);
  
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (navigator.getUserMedia){
    
    function successCallback(stream){
      if (window.webkitURL) {
        video.src = window.webkitURL.createObjectURL(stream);
      } else if (video.mozSrcObject !== undefined) {
        video.mozSrcObject = stream;
      } else {
        video.src = stream;
      }
    }
    
    function errorCallback(error){
    }
    
    navigator.getUserMedia({video: true}, successCallback, errorCallback);
    
    detector = new AR.Detector();

    requestAnimationFrame(tick);

    discoverFileSystem();
    //discoverActuators();
	//discoverSensors();

	$("#back").text("Back");
	$("#back").on("click", function(){
		hideOverlay();
	});

	$("#sensorButton").on("click", function(){
		listenSensor();
	});
  }
}

function tick(){
  requestAnimationFrame(tick);
  
  if (video.readyState === video.HAVE_ENOUGH_DATA){
    snapshot();

    var markers = detector.detect(imageData);
    read(markers);
  }
}

function snapshot(){
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function read(marker){
	for(var i = 0; i !== marker.length; ++i){
		var id = idObject_to_identify[marker[i].id];

		//update grafich
		$("#new_marker").text(marker[i].id);

		if( id  === undefined){
			//console.log("Error! This marker is not associated to any sensor/actuator");
			drawCorners(marker);
	    	drawId(marker);
		}
		else{
			//console.log("Marker correctly readed");
			if(Object.keys(sensor).length == 0 && toFind && Object.keys(actuator).length == 0)
				find(id);
		}
	} 
}

function drawCorners(markers){
  var corners, corner, i, j;

  context.lineWidth = 3;

  for (i = 0; i !== markers.length; ++ i){
    corners = markers[i].corners;
    
    context.strokeStyle = "red";
    context.beginPath();
    
    for (j = 0; j !== corners.length; ++ j){
      corner = corners[j];
      context.moveTo(corner.x, corner.y);
      corner = corners[(j + 1) % corners.length];
      context.lineTo(corner.x, corner.y);
    }

    context.stroke();
    context.closePath();
    
    context.strokeStyle = "green";
    context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
  }
}

function drawId(markers){
  var corners, corner, x, y, i, j;
  
  context.strokeStyle = "blue";
  context.lineWidth = 1;
  
  for (i = 0; i !== markers.length; ++ i){
    corners = markers[i].corners;
    
    x = Infinity;
    y = Infinity;
    
    for (j = 0; j !== corners.length; ++ j){
      corner = corners[j];
      
      x = Math.min(x, corner.x);
      y = Math.min(y, corner.y);
    }

    context.strokeText(markers[i].id, x, y)
  }
}


function find(id){
	toFind = false;

	//sensor
	for (var i = 0; i < sensorServices.length; i++) {
		if(sensorServices[i].id == id){
				sensorServices[i].bind({onBind:function(){
				sensorServices[i].configureSensor({rate: 1000, eventFireMode: "fixedinterval"},
					function(){
						sensor = sensorServices[i];
						toFind = true;
						showOverlay();
					},
					function (){
						sensor = undefined;
						console.error('Error configuring Sensor ' + service.api);
					});
				}
				});
			return;
		}
	}

	//actuator
	for (i = 0; i < actuatorServices.length; i++) {
		if (actuatorServices[i].id == id) {
					actuatorServices[i].bind({onBind:function(){
							actuator = actuatorServices[i];
							toFind = true;
							showOverlay();
					    }
			        });
			return;
		}
	}

//DA VERIFICAREEEEEEEEEEEEE - TODO
	//toFind = true;
}


function showOverlay() {
	$("#overlay").show();
	if(Object.keys(sensor).length != 0) {
		$("#sensorButton").show();
		$("#serviceName").text(sensor.displayName);
		$("#serviceDescription").text(sensor.description);
		listenSensor();
	}
	else if(Object.keys(actuator).length != 0) {
		$("#sensorButton").hide();
		$("#serviceName").text(actuator.displayName);
		$("#serviceDescription").text(actuator.description);
		showActuator();
	}			
}

function hideOverlay() {
	$("#overlay").hide();
	$("#content_chart").empty();
	$("#content_actuator").empty();
	$("#values").empty();
	if(Object.keys(sensor).length != 0) {
		listenSensor(operations.REMOVE);
		sensor = {};
		graphic = undefined;
	}
	else if(Object.keys(actuator).length != 0) {
		actuator = {};
		actComponent = undefined;
	}		
}


function discoverSensors() {
		var serviceType = new ServiceType(sensor_types);
		webinos.discovery.findServices(serviceType, {
					onFound: function (service) {
								sensorServices.push(service);
								insertNewRowInTable(service.id,service.description);
					},
					onLost: function(service){
					},
					onError: function(error){
					}
		});	
}

function discoverActuators() {
		var serviceType = new ServiceType(actuator_types);
		webinos.discovery.findServices(serviceType, {
					onFound: function (service) {
								actuatorServices.push(service);
								insertNewRowInTable(service.id,service.description);
					},
					onLost: function(service){
					},
					onError: function(error){
					}
		});
			
}

function insertNewRowInTable(id, description){
	var found = false;
	var html = "";
	html += '<tr id="'+id+'">';
    html += '<td>'+description+'</td>';
    for(var markerID in idObject_to_identify){
    	if(idObject_to_identify[markerID] == id){
    		html += '<td id="markerID_'+id+'">'+markerID+'</td>';
    		found = true;
    		break;
    	}
    }
    if(!found)
    	html += '<td id="markerID_'+id+'"></td>';
    html += '<td><div id="remove_'+id+'"><img width="15px" height="15px" src="assets/img/x_min.png" style="float:right;"></div></td>';
    html += '</tr>';

    $("#example").append(html);

    
    $("#"+id).on("click", function(){
    	if(toRemoveFromFile == operations.ADD){
	    	var saID = this.id;
	    	var markerID = $("#new_marker").text();
	    	if(markerID.length != 0){
	    		//IF THERE IS another marker with the same sensor ID, I have to remove this!
		    	for(var i in idObject_to_identify){
		    		if(idObject_to_identify[i] == saID)
		    			delete idObject_to_identify[i];
		    	}

	    		idObject_to_identify[markerID] = saID;
	    		save_file(idObject_to_identify, file_name_aruco);
	    		//var idElem = "#markerID_"+saID;
	    		//$(idElem).text(markerID);
	    	}
    	}
    	updateGUIMarkerMatching();
    	toRemoveFromFile = operations.ADD;
	});
	

	$("#remove_"+id).on("click", function(){
    	var splittingString = this.id.split("_");
    	var markerID;
    	for(var i in idObject_to_identify){
    		if(idObject_to_identify[i] == splittingString[1]){
    				markerID = i;
    		}
    	}
    	delete idObject_to_identify[markerID];
    	save_file(idObject_to_identify, file_name_aruco);
    	toRemoveFromFile = operations.REMOVE;
	});

}

function updateGUIMarkerMatching(){
	//sensors
	for(var j in sensorServices){
		var isThereMarkerMatched = "";
		for(var i in idObject_to_identify){
			if(idObject_to_identify[i] == sensorServices[j].id){
				isThereMarkerMatched = i;
				break;
			}
		}
		var idElem = "#markerID_"+sensorServices[j].id;
		$(idElem).text("");
		$(idElem).text(isThereMarkerMatched);
	}

	//actuators
	for(var j in actuatorServices){
		var isThereMarkerMatched = "";
		for(var i in idObject_to_identify){
			if(idObject_to_identify[i] == actuatorServices[j].id){
				isThereMarkerMatched = i;
				break;
			}
		}
		var idElem = "#markerID_" + actuatorServices[j].id;
		$(idElem).text("");
		$(idElem).text(isThereMarkerMatched);
	}
}

function listenSensor(staticRegistered){

	if(staticRegistered !== undefined)
		registered = staticRegistered;

	if(!registered){
		if(sensor.api.indexOf("temperature") !== -1 && graphic === undefined)
			graphic = new Thermometer(sensor.id);
		else if(graphic === undefined)
			graphic = new LineChart(sensor.id);

		sensor.addEventListener('sensor', eventListenerFunction, true);
		registered = true;
		$("#sensorButton").text("Stop");
	}
	else{
		sensor.removeEventListener('sensor', eventListenerFunction, true);
		registered = false;
		$("#sensorButton").text("Start");
	}
}

function showActuator(){
	if(actuator.range[0].length == 2 && actComponent === undefined){
		if(actuator.range[0][0] == 0 && actuator.range[0][1] == 1)
			actComponent = new Switch(actuator.id, 0, 1);
		else
			actComponent = new Slider(actuator.id, actuator.range[0][0], actuator.range[0][1]);
	}
	else if(actComponent === undefined)
		actComponent = new InputBox(actuator.id);
}

