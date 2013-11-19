var min_temperature_range = -30;
var max_temperature_range = 70;

Function.prototype.subclassFrom=function(superClassFunc) {
    if (superClassFunc == null) {
        this.prototype={};
    } 
    else {
        this.prototype = new superClassFunc();
        this.prototype.constructor=this;
        this.superConstructor=superClassFunc;   
  }
}

Function.prototype.methods=function(funcs) {
    for (each in funcs) 
        if (funcs.hasOwnProperty(each)) {
            var original=this.prototype[each];
            funcs[each].superFunction=original;
            this.prototype[each]=funcs[each];
        }
}


function Graphic(sensorID) {
    this.sensorIDAssociated = sensorID;
    this.graphData =[];
    this.values=[];
    this.service_list=[];
    this.numberOfValues=0;
    this.title='';
    this.type='';
    this.options='';
    this.minRange;
    this.maxRange;
}

Graphic.methods({
    setVal : function(val) {}
});


/*
function Thermometer(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    
    this.type="thermometer";
    this.minRange=min_temperature_range;
    this.maxRange=max_temperature_range;
    
    $("#content_chart").prepend(this.getHTMLContent());
    this.chart = new RGraph.Thermometer("chart", this.minRange, this.maxRange, 0);
    RGraph.Effects.Thermometer.Grow(this.chart);
}

Thermometer.subclassFrom(Graphic);

Thermometer.methods({
    setVal : function(val) {
        this.chart.value = val;
        RGraph.Effects.Thermometer.Grow(this.chart);
    },
    getHTMLContent : function(){
        var html = "<canvas id='chart' width='100' height='300' class='thermometer_style'></canvas>";
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        return "<div id='range'> Range:     Min <input type='text' id='min_range-"+this.service_list[sensor]+"' value='"+this.minRange+"'>        Max <input type='text' id='max_range-"+this.service_list[sensor]+"' value='"+this.maxRange+"'></div>";
    }
});
*/

/*
function Thermometer(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    
    this.type="thermometer";
    this.minRange=min_temperature_range;
    this.maxRange=max_temperature_range;
    
    $("#content_chart").prepend(this.getHTMLContent());
    this.initThermometer();
    //this.chart = new RGraph.Thermometer("chart", this.minRange, this.maxRange, 0);
    //RGraph.Effects.Thermometer.Grow(this.chart);
}

Thermometer.subclassFrom(Graphic);

Thermometer.methods({
    setVal : function(val) {
        //this.chart.value = val;
        //RGraph.Effects.Thermometer.Grow(this.chart);

        $("#gauge").wijlineargauge("option", "ranges", [
        {
            startValue: -10,
            endValue: val,
            startDistance: 0.75,
            endDistance: 0.75,
            startWidth: 0.15,
            endWidth: 0.15,
            style: {
                fill: "180-#FF0000-#CC0000",
                stroke: "none"
            }
        }
        ]).wijlineargauge("redraw");
    },
    getHTMLContent : function(){
        var html = "<div id='gauge' class='ui-corner-all'></div>";
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        return "<div id='range'> Range:     Min <input type='text' id='min_range-"+this.service_list[sensor]+"' value='"+this.minRange+"'>        Max <input type='text' id='max_range-"+this.service_list[sensor]+"' value='"+this.maxRange+"'></div>";
    },
    initThermometer : function(){
        $("#gauge").wijlineargauge({
            width: 100,
            height: 400,
            orientation: "vertical",
            xAxisLocation: 0.02,
            xAxisLength: 0.95,
            //value: 40,
            labels: {
                style: {
                    fill: "#1E395B",
                    "font-size": 20,
                    "font-weight": "300"
                }
                },
            tickMajor: {
                position: "inside",
                offset: -12,
                factor: 2,
                style: {
                    fill: "#000",
                    stroke: "none",
                    opacity: 0.2
                }
            },
            tickMinor: {
                position: "inside",
                offset: -12,
                visible: true,
                style: {
                    fill: "#000",
                    stroke: "none",
                    opacity: 0.2
                }
            },
            animation: {
                enabled: false
            },
            pointer: {
                visible: false,
                shape: "tri",
                length: 0.5,
                width: 4,
                style: {
                    fill: "#000",
                    stroke: "#434343",
                    "stroke-width": 0.5,
                    opacity: 0.8
                }
            },
            face: {
                style: {
                    fill: "180-#e4e4e4-#c0c0c0",
                    stroke: "#8d8d8d",
                    "stroke-width": 0.5
                }
            },
            ranges: [
            {
                startValue: -10,
                endValue: 50,
                startDistance: 0.75,
                endDistance: 0.75,
                startWidth: 0.15,
                endWidth: 0.15,
                style: {
                    fill: "180-#FF0000-#CC0000",
                    stroke: "none"
                }
            }
            ]
        });
    }
});
*/


function Thermometer(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    
    this.type="thermometer";
    this.minRange=min_temperature_range;
    this.maxRange=max_temperature_range;
    this.values = { v1: 10 };
    
    $("#content_chart").prepend(this.getHTMLContent());
    this.initThermometer();
}

Thermometer.subclassFrom(Graphic);

Thermometer.methods({
    setVal : function(val) {
        $(this.values).animate({
            v1: val
        },
        {
            duration: 600,
            step: function () {
                var scales = $('#jqLinearGauge').jqLinearGauge('option', 'scales');

                scales[0].barMarkers[0].value = this.v1;

                $('#jqLinearGauge').jqLinearGauge('update');
            },
            complete: function () {
                //nothing
            }
        });
    },
    getHTMLContent : function(){
        var html = '<div id="jqLinearGauge" style="width: 110px; height: 340px;" class="thermometer_style"></div>';
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        return "<div id='range'> Range:     Min <input type='text' id='min_range-"+this.service_list[sensor]+"' value='"+this.minRange+"'>        Max <input type='text' id='max_range-"+this.service_list[sensor]+"' value='"+this.maxRange+"'></div>";
    },
    initThermometer: function(){

        var gradient1 = {
            type: 'linearGradient',
            x0: 0,
            y0: 0.5,
            x1: 1,
            y1: 0.5,
            colorStops: [{ offset: 0, color: '#FF3366' },
                         { offset: 1, color: '#B2183E'}]
        };

        $('#jqLinearGauge').jqLinearGauge({
            orientation: 'vertical',
            background: '#F7F7F7',
            border: {
                lineWidth: 8,
                strokeStyle: '#76786A',
                padding: 8
            },
            scales: [
                     {
                         minimum: -10,
                         maximum: 60,
                         interval: 10,
                         labels: {
                             offset: 0.03
                         },
                         majorTickMarks: {
                             offset: 0.20,
                             lineWidth: 2
                         },
                         minorTickMarks: {
                             visible: true,
                             offset: 0.24,
                             interval: 2,
                             lineWidth: 2
                         },
                         barMarkers: [
                                        {
                                            value: this.values.v1,
                                            fillStyle: gradient1,
                                            innerOffset: 0.40,
                                            outerOffset: 0.56
                                        }
                                     ]
                     }
                ]
        });
    }
});


function LineChart(sensorID){
    arguments.callee.superConstructor.call(this, sensorID);
    this.type="line-chart";
    
    this.graphData=new google.visualization.DataTable();
    this.graphData.addColumn('string','Data');
    this.graphData.addColumn('number',null);
    this.options = {
        title: '',
        chartArea: {width: '90%', height: '75%', top:'25', left: '50'},
        //legend: {position: 'top'},
        titlePosition: 'in', axisTitlesPosition: 'in',
        hAxis: {textPosition: 'out'}, vAxis: {textPosition: 'out'},     
        colors:['blue','red','orange','green','violet','brown','pink','yellow'],
        pointSize: 0
    };

    $("#content_chart").prepend(this.getHTMLContent());
    var chart_div = document.getElementById("chart");
    this.chart = new google.visualization.LineChart(chart_div);
    this.chart.draw(this.graphData, this.options);
}

LineChart.subclassFrom(Graphic);

LineChart.methods({
    setVal : function(val) {
        alert("check here");
    },
    getHTMLContent : function(){
        var html = "<div id='chart' class='lineChart_style'></div>";
        return html;
    },
    getCustomSettingsForSensor : function(sensor){
        var html = "";
        html+= "<div id='color' class='param_td'>Color";
        html+= "<select id='cfg_color-"+this.service_list[sensor]+"'>";
        for(var i=0;i<this.options.colors.length;i++){
            if(lineColor[i]==this.options.colors[sensor]){
                html+= "<option selected value='"+lineColor[i]+"'>"+lineColor[i]+"</option>";
            }
            else{
                html+= "<option value='"+lineColor[i]+"'>"+lineColor[i]+"</option>";
            }
        }
        html+= "</select>"; 
        return html;
    }
});