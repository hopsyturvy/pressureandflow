var AmLoaded = false,
input = $('input')
store = "PressureAndFlowSettings"
var shotTimeout
var flowWeight=""
var shotWeight=""

//initialise graph data variables
var puckResistanceGraph=[0,0], puckPressureGraph=[0,0], pumpPressureGraph=[0,0],flowRestrictorGraph=[0,0],flowGraph=[0,0];
var oldpuckResistanceGraph=[0,0], oldpuckPressureGraph=[0,0], oldpumpPressureGraph=[0,0], oldflowRestrictorGraph=[0,0], oldflowGraph=[0,0]

var puckResistanceDataset={color: "#2dc48a", label: 'Puck resistance', yaxis:2, data:puckResistanceGraph}
var puckPressureDataset={color: "#e55acb", label: 'Puck pressure', yaxis:1, data:puckPressureGraph}
var pumpPressureDataset={color: "#e02d4f", label: 'Pump pressure', yaxis:1, data:pumpPressureGraph}
var flowRestrictorDataset={color: "#ffd93b", label: 'Restrictor resistance', yaxis:2, data:flowRestrictorGraph}
var flowDataset={color: "#41aad8", label: 'Flow', yaxis:3, data:flowGraph}

var oldpuckResistanceDataset={color: "#adf0cd", label: 'oldPuck resistance', yaxis:2, data:oldpuckResistanceGraph}
var oldpuckPressureDataset={color: "#e8b7e0", label: 'oldPuck pressure', yaxis:1, data:oldpuckResistanceGraph}
var oldpumpPressureDataset={color: "#f1bec9", label: 'oldPump pressure', yaxis:1, data:oldpuckResistanceGraph}
var oldflowRestrictorDataset={color: "#f0e5ae", label: 'oldRestrictor resistance', yaxis:2, data:oldpuckResistanceGraph}
var oldflowDataset={color: "#b3d7f4", label: 'oldFlow', yaxis:3, data:oldpuckResistanceGraph}

//initialise graph
var dataset = [
	oldpuckResistanceDataset,
	oldpuckPressureDataset,
	oldpumpPressureDataset,
	oldflowRestrictorDataset,
	oldflowDataset,
	puckResistanceDataset,
	puckPressureDataset,
	pumpPressureDataset,
	flowRestrictorDataset,
	flowDataset,
];
var options = {
	yaxes: [{
			min: 0, max: 10, show:true, labelWidth: 0, labelHeight: 0, reserveSpace: null, tickFormatter: function(){return ""}
		}, {
			min: 0, max: 10, position: "right", show:false
		}, {
			min:0, max: 5, show:false
	}],
	xaxis: {min: 0, max: 30},
	legend: false,
	series: {
		shadowSize: 0,
	},
	grid: {
		hoverable: true
	}
}
var plot


$(document).ready(function () {

		//check for changes to slider and call calculator functions

	$("#SlidePump_pressure").slider({tooltip: "always"}).on("slide", function () {_pumpPressure()});
	$("#SlidePuck_pressure").slider({tooltip: "always"}).on("slide", function (value) {_puckPressure()});
	$("#SlideFlow_restrictor_resistance").slider({tooltip: "always"}).on("slide", function (value) {_restrictorResistance()});
	$("#SlidePuck_resistance").slider({tooltip: "always"}).on("slide", function (value) {_puckResistance()});
	$("#SlideFlow").slider({ tooltip: "always" }).on("slide", function (value) { _flow() });

	$("#SlidePump_pressure").slider({tooltip: "always"}).on("slideStop", function () {_pumpPressure()});
	$("#SlidePuck_pressure").slider({tooltip: "always"}).on("slideStop", function (value) {_puckPressure()});
	$("#SlideFlow_restrictor_resistance").slider({tooltip: "always"}).on("slideStop", function (value) {_restrictorResistance()});
	$("#SlidePuck_resistance").slider({tooltip: "always"}).on("slideStop", function (value) {_puckResistance()});
	$("#SlideFlow").slider({ tooltip: "always" }).on("slideStop", function (value) {_flow() });

	$("#SlidePump_pressure").slider({tooltip: "always"}).on("slideStop", function () {_drops()});
	$("#SlidePuck_pressure").slider({tooltip: "always"}).on("slideStop", function (value) {_drops()});
	$("#SlideFlow_restrictor_resistance").slider({tooltip: "always"}).on("slideStop", function (value) {_drops()});
	$("#SlidePuck_resistance").slider({tooltip: "always"}).on("slideStop", function (value) {_drops()});
	$("#SlideFlow").slider({ tooltip: "always" }).on("slideStop", function (value) {_drops() });
	
	plot=$.plot($("#graph"), dataset, options);
	console.log(dataset)
	
	_resize()
	_display()
	_drops()
	
})

function _resize() {
var imageHeight = (Math.floor(document.getElementById("Machine_transparency").clientHeight)-1)+'px';
var imageWidth = document.getElementById("Machine_transparency").clientWidth;
document.getElementById("graph").style.height = imageHeight;
plot.resize()
plot.setupGrid()
plot.draw()
}


function _pumpPressure() {
		//read values
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())
	var totalResistance= Puck_resistance+Flow_restrictor_resistance

		//run calculation
	Flow=Pump_pressure/totalResistance
	Puck_pressure=Puck_resistance*Flow

		//set slider values
	$('#SlidePuck_pressure').slider('setValue', Puck_pressure);
	$('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {_flow()} else {_display()}
}

function _puckPressure() {
		//read values
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())

		//run calculation
	var totalResistance=Puck_resistance+Flow_restrictor_resistance
	Flow=Puck_pressure/Puck_resistance
	Pump_pressure=totalResistance*Flow

		//catch excess pump pressure
	if (Pump_pressure > 12) {
		Pump_pressure=12;
		$('#SlidePump_pressure').slider('setValue', Pump_pressure);
		_pumpPressure();
	} else {

		//set slider values
	$('#SlidePump_pressure').slider('setValue', Pump_pressure);
	$('#SlideFlow').slider('setValue', Flow);
	}

		//catch overflow
	if  (Flow > 15) {_flow()} else {_display()}
}


function _restrictorResistance() {
		//read values
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())

		//run calculation
	var totalResistance=Puck_resistance+Flow_restrictor_resistance
	Flow=Pump_pressure/totalResistance
	Puck_pressure=Puck_resistance*Flow

		//set slider values
	$('#SlidePuck_pressure').slider('setValue', Puck_pressure);
	$('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {_flow()} else {_display()}
}

function _puckResistance() {
		//read values
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())

		//run calculation
	var totalResistance=Puck_resistance+Flow_restrictor_resistance
	Flow=Pump_pressure/totalResistance
	Puck_pressure=Puck_resistance*Flow

		//set slider values
	$('#SlidePuck_pressure').slider('setValue', Puck_pressure);
	$('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {_flow()} else {_display()}
}

function _display() {
		//read values
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())

		//set colour: puck
	var puckColor=[255-(Puck_pressure/12)*50,255-(Puck_pressure/12)*255,255-(Puck_pressure/12)*255]
	document.getElementById("puck-bg").style.backgroundColor= "rgb("+puckColor+")";
		//set colour: pump
	var pumpColor=[255-(Pump_pressure/12)*50,255-(Pump_pressure/12)*255,255-(Pump_pressure/12)*255]
	document.getElementById("pump-bg").style.backgroundColor= "rgb("+pumpColor+")";
		//set colour: restrictor gradient
	document.getElementById("restrictor-bg").style.backgroundImage= "-webkit-linear-gradient(left, rgb("+puckColor+") 0%, rgb("+pumpColor+") 100%)";

		//set restrictor size
	var restrictorSize=100-(Flow_restrictor_resistance*10)
	document.getElementById("restrictor-bg").style.height= restrictorSize+"%";
}

	

function _drops() {
	var Flow= parseFloat($('#SlideFlow').val())
	var flowScaling=Flow/10
	var droplets=150*flowScaling
	document.getElementById("rain").innerHTML=""

	for (let r = 0; r < droplets; r++) {
		var leftPosition=Math.floor(Math.random() * 100)
		var topPosition=-50-Math.floor(Math.random() * 50)
		var pathOpacity=Math.random()
		var animationDuration=(Math.random() + 0.7)
		var animationDelay=Math.random() * 2 - 1
		var pathScale=Math.random()/2+.3

		document.getElementById("rain").innerHTML+=
		'<svg class=\"rain__drop\" id=\"drop'+r+'\" preserveAspectRatio=\"xMinYMin\" viewBox=\"0 0 5 50\"><path id=\"dropPath'+r+'\"stroke=\"none\" d=\"M 2.5,0 C 2.6949458,3.5392017 3.344765,20.524571 4.4494577,30.9559 5.7551357,42.666753 4.5915685,50 2.5,50 0.40843152,50 -0.75513565,42.666753 0.55054234,30.9559 1.655235,20.524571 2.3050542,3.5392017 2.5,0 Z\"><\/path><\/svg>'

		document.getElementById("drop"+r).style.left= leftPosition+'%'
		document.getElementById("drop"+r).style.top= topPosition+'%'
		document.getElementById("dropPath"+r).style.opacity= pathOpacity
		document.getElementById("drop"+r).style.setProperty('--animation-duration', animationDuration+'s')
		document.getElementById("drop"+r).style.setProperty('--animation-delay', animationDelay+'s')
		document.getElementById("dropPath"+r).style.setProperty('--path-scale', pathScale)
	}
}

function _flow() {
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_restrictor_resistance= parseFloat($('#SlideFlow_restrictor_resistance').val())
	var Puck_resistance= parseFloat($('#SlidePuck_resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())

		//since max slider value of flow is 15, this calculates pressure at this flow rate
	var totalResistance=Puck_resistance+Flow_restrictor_resistance
	Pump_pressure = Flow*totalResistance
	Puck_pressure = Puck_resistance*Flow

		//adjust pressure values to compensate
	$('#SlidePump_pressure').slider('setValue', Pump_pressure);
	$('#SlidePuck_pressure').slider('setValue', Puck_pressure);

	_display();
}

function _switch() {

	if (document.getElementById('machinewrapper').style.visibility==='hidden'){
		document.getElementById('machinewrapper').style.visibility='visible'
		document.getElementById('graphwrapper').style.visibility='hidden'
		document.getElementById('pumpcheckmark').style.visibility='hidden'
		document.getElementById('puckcheckmark').style.visibility='hidden'
		document.getElementById('restrictorcheckmark').style.visibility='hidden'
		document.getElementById('resistancecheckmark').style.visibility='hidden'
		document.getElementById('flowcheckmark').style.visibility='hidden'
		document.getElementById("shotweight").style.visibility='hidden'

		document.getElementById('pumpcheckcontainer').style.pointerEvents='none'
		document.getElementById('puckcheckcontainer').style.pointerEvents='none'
		document.getElementById('restrictorcheckcontainer').style.pointerEvents='none'
		document.getElementById('resistancecheckcontainer').style.pointerEvents='none'
		document.getElementById('flowcheckcontainer').style.pointerEvents='none'

		document.getElementById('Graph_switch').innerHTML='Switch to Graph';
	} else {
		document.getElementById('machinewrapper').style.visibility='hidden'
		document.getElementById('graphwrapper').style.visibility='visible'
		document.getElementById('pumpcheckmark').style.visibility='visible'
		document.getElementById('puckcheckmark').style.visibility='visible'
		document.getElementById('restrictorcheckmark').style.visibility='visible'
		document.getElementById('resistancecheckmark').style.visibility='visible'
		document.getElementById('flowcheckmark').style.visibility='visible'
		document.getElementById("shotweight").style.visibility='visible'

		document.getElementById('pumpcheckcontainer').style.pointerEvents='auto'
		document.getElementById('puckcheckcontainer').style.pointerEvents='auto'
		document.getElementById('restrictorcheckcontainer').style.pointerEvents='auto'
		document.getElementById('resistancecheckcontainer').style.pointerEvents='auto'
		document.getElementById('flowcheckcontainer').style.pointerEvents='auto'

		document.getElementById('Graph_switch').innerHTML='Switch to Diagram';
		//***call some function here: empty graph?***
	}
}

function _puckSim() {
		//simulate puck resistance during shot, returns array of all data
	var puckResistanceData = []
		//preinfusion time = 5 +- 1s
	var preinfuse=5 + Math.floor(Math.random()*2-1)
		//set resistance: baseline and additional
	var baselineRes=1.5
	var res=5 + Math.floor(Math.random()*2-1)

		//preinfusion steps
	for (var i=0; i < preinfuse; i+=0.5) {
		puckResistanceData.push ([i, 0.1])
	}
		//ramp up step
	puckResistanceData.push ([preinfuse, (res+baselineRes)*.7])

		//shot flowing steps
	for (var i=0; i < (30-preinfuse); i+=0.5) {
		puckResistanceData.push ([i+preinfuse+0.5, res+baselineRes])
		var res=res*(0.7+Math.random()*.4)
	}
	return puckResistanceData
}

function _runShot() {
	//set switch to stop
	document.getElementById('Simulate').setAttribute('onclick', '_stopShot()')


	clearTimeout(shotTimeout);
	var currentTicks=0;
	var puckResistanceGraphData=_puckSim();
	shotWeight=0
	flowWeight=0
	

	iterate();

	function _nextData() {

		//update resistance slider and recalculate all values
		var currentPuckResist=puckResistanceGraphData[currentTicks];
		$('#SlidePuck_resistance').slider('setValue', parseFloat(currentPuckResist[1]));
		_puckResistance();
		
		//read new values off sliders and create datapoints
		var currentPuckPressure=[(currentTicks/2), parseFloat($('#SlidePuck_pressure').val())]
		var currentPumpPressure=[(currentTicks/2), parseFloat($('#SlidePump_pressure').val())]
		var currentFlowRestrictorResistance=[(currentTicks/2), parseFloat($('#SlideFlow_restrictor_resistance').val())]
		var currentFlow=[(currentTicks/2), parseFloat($('#SlideFlow').val())]

		//add values to graph
		puckResistanceGraph.push(currentPuckResist)
		puckPressureGraph.push(currentPuckPressure)
		pumpPressureGraph.push(currentPumpPressure)
		flowRestrictorGraph.push(currentFlowRestrictorResistance)
		flowGraph.push(currentFlow)

		//update shot weight (/2 for 2 ticks/sec; assumes 20g coffee/headspace absorbs 40g water)
		flowWeight+=(currentFlow[1]/2)
		if (flowWeight<40) {
			shotWeight=0
		} else {
			shotWeight=flowWeight-40
		}
		console.log(flowWeight)
		document.getElementById("shotweight").innerHTML=shotWeight.toFixed(1)+"g"

		//increment timer
		currentTicks+=1
	} 

	function _drawDatapoint() {
		_nextData();
		var temp=plot.getData()
		temp[5].data = puckResistanceGraph
		temp[6].data = puckPressureGraph
		temp[7].data = pumpPressureGraph
		temp[8].data = flowRestrictorGraph
		temp[9].data = flowGraph

		
		plot.setData(temp);
		plot.draw();

	}
	
	function iterate() {
		if (currentTicks > 60) {
		_stopShot()
		} else {
		_drawDatapoint();
		shotTimeout=setTimeout(iterate,500)
		}
	}
}

function _stopShot () {
	clearTimeout(shotTimeout)
	console.log(plot.getData())
	document.getElementById('Simulate').setAttribute('onclick', '_runShot()')
	oldpuckResistanceGraph.push ([0,null])
	oldpuckResistanceGraph.push.apply (oldpuckResistanceGraph, puckResistanceGraph)
	
	oldpuckPressureGraph.push ([0,null])
	oldpuckPressureGraph.push.apply (oldpuckPressureGraph, puckPressureGraph)

	oldpumpPressureGraph.push ([0,null])
	oldpumpPressureGraph.push.apply (oldpumpPressureGraph, pumpPressureGraph)

	oldflowRestrictorGraph.push ([0,null])
	oldflowRestrictorGraph.push.apply (oldflowRestrictorGraph, flowRestrictorGraph)

	oldflowGraph.push ([0,null])
	oldflowGraph.push.apply (oldflowGraph, flowGraph)
	
	
	var temp=plot.getData()
	temp[0].data = oldpuckResistanceGraph
	temp[1].data = oldpuckPressureGraph
	temp[2].data = oldpumpPressureGraph
	temp[3].data = oldflowRestrictorGraph
	temp[4].data = oldflowGraph

	
	plot.setData(temp);


	puckResistanceGraph=[], puckPressureGraph=[], pumpPressureGraph=[],flowRestrictorGraph=[],flowGraph=[];

}


function _clearGraph() {
	clearTimeout(shotTimeout)
	puckResistanceGraph=[0,0], puckPressureGraph=[], pumpPressureGraph=[], flowRestrictorGraph=[],flowGraph=[];
	oldpuckResistanceGraph=[], oldpuckPressureGraph=[], oldpumpPressureGraph=[], oldflowRestrictorGraph=[], oldflowGraph=[];

	document.getElementById('Simulate').setAttribute('onclick', '_runShot()');
	var temp=plot.getData();
	for (i=0; i<temp.length; i++){
	temp[i].data = [0,0]
	}
	
	plot.setData(temp);
	plot.draw()
}

function _toggleSeries (seriesIdx, seriesIdy) {
	var someData = plot.getData();
	someData[seriesIdx].lines.show = !someData[seriesIdx].lines.show;
	someData[seriesIdy].lines.show = !someData[seriesIdy].lines.show;
	console.log(someData[seriesIdy])
	plot.setData(someData);
	plot.draw();
}




function calcIt() {
	if (!AmLoaded) return
	//This stores all your settings in localStorage
	var ThemAll = setupCheckRadio(input)
	if (localStorage) {localStorage.setItem(store, ThemAll)}
	//Basic reading of all inputs (Sliders, Textboxes, Radio/Check is here for your convenience)
	var Pump_pressure= parseFloat($('#SlidePump_pressure').val())
	var Puck_pressure= parseFloat($('#SlidePuck_pressure').val())
	var Flow_Restrictor_Resistance= parseFloat($('#SlideFlow_Restrictor_Resistance').val())
	var Puck_Resistance= parseFloat($('#SlidePuck_Resistance').val())
	var Flow= parseFloat($('#SlideFlow').val())
	var PPts1=[]; PPts1.push([0,0]); PPts1.push([100,100])
	var options1= {grid: { hoverable: true, mouseActiveRadius: 4,backgroundColor:"#fdfdfd"}, xaxis: {min: 0, max: 100, axisLabel: "X",}, yaxis: {min: 0, max: 100, axisLabel: "Y",},}
	$.plot($("#Puck"),[{ data:PPts1}], options1)
	
		
	//This only draws into the first canvas if you happen to have more than one
	//It's only showing how the basics work to get you started
	var theCanvas = document.getElementById('Pump');
	$("#Pump").clearCanvas()
	var yheight = theCanvas.height
	var xwidth=theCanvas.width
	var r = yheight/2
	var xc = xwidth/2
	var yc = yheight/2
	$("#Pump").drawRect({
		fillStyle: "cyan",
		x: 0, y: 0,
		width: xwidth, height: yheight,fromCenter:false
	})
	$("#Pump").drawEllipse({
		fillStyle: "green",
		x: xc, y: yc,
		width: r, height: r
	})
		
}
