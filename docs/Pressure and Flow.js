/*

Raindrop animations copyright (c) 2020 by Jhey (https://codepen.io/jh3y/pen/WyNdMG)
All other code copyright (c) 2020 Tom Hopkinson (https://github.com/hopsyturvy/)

Permission is hereby granted, free of charge, to any person 
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall 
be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

*/


var shotTimeout

//initialise graph data variables
var puckResistanceGraph=[0,0], puckPressureGraph=[0,0], pumpPressureGraph=[0,0],flowRestrictorGraph=[0,0],flowGraph=[0,0];
var oldpuckResistanceGraph=[0,0], oldpuckPressureGraph=[0,0], oldpumpPressureGraph=[0,0], oldflowRestrictorGraph=[0,0], oldflowGraph=[0,0]

var puckResistanceDataset={color: "#6cbea1", label: 'Puck resistance', yaxis:2, data:puckResistanceGraph}
var puckPressureDataset={color: "#bb6cae", label: 'Puck pressure', yaxis:1, data:puckPressureGraph}
var pumpPressureDataset={color: "#ca4363", label: 'Pump pressure', yaxis:1, data:pumpPressureGraph}
var flowRestrictorDataset={color: "#ebbd53", label: 'Restrictor resistance', yaxis:2, data:flowRestrictorGraph}
var flowDataset={color: "#65a3ce", label: 'Flow', yaxis:3, data:flowGraph}

var oldpuckResistanceDataset={color: "#adf0cd", label: 'oldPuck resistance', yaxis:2, data:oldpuckResistanceGraph}
var oldpuckPressureDataset={color: "#e8b7e0", label: 'oldPuck pressure', yaxis:1, data:oldpuckResistanceGraph}
var oldpumpPressureDataset={color: "#f1bec9", label: 'oldPump pressure', yaxis:1, data:oldpuckResistanceGraph}
var oldflowRestrictorDataset={color: "#f0e5ae", label: 'oldRestrictor resistance', yaxis:2, data:oldpuckResistanceGraph}
var oldflowDataset={color: "#b3d7f4", label: 'oldFlow', yaxis:3, data:oldpuckResistanceGraph}

var plot


setTimeout(function(){ screenResize; updateDisplay; console.log("init")}, 3000);

jQuery(document).ready(function () {




	
	drawDrops()
		//check for changes to slider and call calculator functions

	jQuery("#SlidePumpPressure").slider({tooltip: "always"}).on("slide", function () {pumpPressure()});
	jQuery("#SlidePuckPressure").slider({tooltip: "always"}).on("slide", function (value) {puckPressure()});
	jQuery("#SlideFlowRestrictorResistance").slider({tooltip: "always"}).on("slide", function (value) {restrictorResistance()});
	jQuery("#SlidePuckResistance").slider({tooltip: "always"}).on("slide", function (value) {puckResistance()});

	jQuery("#SlidePumpPressure").slider({tooltip: "always"}).on("slideStop", function () {pumpPressure()});
	jQuery("#SlidePuckPressure").slider({tooltip: "always"}).on("slideStop", function (value) {puckPressure()});
	jQuery("#SlideFlowRestrictorResistance").slider({tooltip: "always"}).on("slideStop", function (value) {restrictorResistance()});
	jQuery("#SlidePuckResistance").slider({tooltip: "always"}).on("slideStop", function (value) {puckResistance()});
	jQuery("#SlideFlow").slider({tooltip: "always"}).on("slideStop", function (value) {flowChange()});
	
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
	
	window.addEventListener("resize", screenResize);

	plot=jQuery.plot(jQuery("#graph"), dataset, options);
	
	screenResize()
	updateDisplay()
	
	console.log('first init');
})

jQuery(document).ready(function(){
	console.log('doc loaded and ready');
  });


function screenResize(inputFromWP) {
	console.log(inputFromWP)
	let imageHeight
	let body=document.getElementById("appscreen")
	 console.log("resize")

	let aspectratio=1450/880
	if(body.clientWidth / body.clientHeight < aspectratio) {
		imageHeight = body.clientHeight-(Math.floor(document.getElementById("controls").clientHeight));
	} else {
		imageHeight = body.clientHeight;
	}

	let displaywidth = 640 * document.getElementById("displaybox").clientWidth / document.getElementById("displaybox").clientHeight
	let displayoffset = (640-displaywidth)/2
	let machinedrawing = document.getElementById("machinedrawing")
	
	console.log(displaywidth)

	machinedrawing.setAttribute("viewBox", displayoffset + " 0 " + displaywidth + " 640" )



	document.getElementById("graph").style.height = imageHeight+'px';
	plot.resize()
	plot.setupGrid()
	plot.draw()

	let puckLocation = document.getElementById("puck4").getBoundingClientRect()
	document.getElementById("rain").style.top = puckLocation.bottom+"px"
	document.getElementById("rain").style.left = puckLocation.left+puckLocation.width*.075+"px"
	document.getElementById("rain").style.width = puckLocation.width*.85+"px"
	document.getElementById("rain").style.height = puckLocation.width*1.5+"px"
}


function pumpPressure() {
		//read values
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())
	var totalResistance= PuckResistance+FlowRestrictorResistance

		//run calculation
	Flow=PumpPressure/totalResistance
	PuckPressure=PuckResistance*Flow

		//set slider values
	jQuery('#SlidePuckPressure').slider('setValue', PuckPressure);
	jQuery('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {
		flowChange()
	} else {
		updateDisplay();
	}
}

function puckPressure() {
		//read values
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())

		//run calculation
	var totalResistance=PuckResistance+FlowRestrictorResistance
	Flow=PuckPressure/PuckResistance
	PumpPressure=totalResistance*Flow

		//catch excess pump pressure
	if (PumpPressure > 12) {
		PumpPressure=12;
		jQuery('#SlidePumpPressure').slider('setValue', PumpPressure);
		pumpPressure();
	} else {

		//set slider values
	jQuery('#SlidePumpPressure').slider('setValue', PumpPressure);
	jQuery('#SlideFlow').slider('setValue', Flow);
	}

		//catch overflow
	if  (Flow > 15) {
		flowChange()
	} else {
		updateDisplay();
	}
}


function restrictorResistance() {
		//read values
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())

		//run calculation
	var totalResistance=PuckResistance+FlowRestrictorResistance
	Flow=PumpPressure/totalResistance
	PuckPressure=PuckResistance*Flow

		//set slider values
	jQuery('#SlidePuckPressure').slider('setValue', PuckPressure);
	jQuery('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {
		flowChange()
	} else {
		updateDisplay();
	}
}

function puckResistance() {
		//read values
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())

		//run calculation
	var totalResistance=PuckResistance+FlowRestrictorResistance
	Flow=PumpPressure/totalResistance
	PuckPressure=PuckResistance*Flow

		//set slider values
	jQuery('#SlidePuckPressure').slider('setValue', PuckPressure);
	jQuery('#SlideFlow').slider('setValue', Flow);

		//catch overflow
	if  (Flow > 15) {
		flowChange()
	} else {
		updateDisplay();
	}
}

function updateDisplay() {
		//read values
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())

		//set colour: puck
	var puckColor=[255-(PuckPressure/12)*63,255-(PuckPressure/12)*217,255-(PuckPressure/12)*202]
	document.getElementById("puck1").style.fill= "rgb("+puckColor+")";
	document.getElementById("puck2").style.fill= "rgb("+puckColor+")";
	document.getElementById("puck3").style.fill= "rgb("+puckColor+")";
	document.getElementById("puck4").style.fill= "rgb("+puckColor+")";

		//set colour: pump
	var pumpColor=[255-(PumpPressure/12)*63,255-(PumpPressure/12)*217,255-(PumpPressure/12)*202]
	document.getElementById("pump1").style.stroke= "rgb("+pumpColor+")";
	document.getElementById("pump2").style.stroke= "rgb("+pumpColor+")";

		//set colour: restrictor gradient
	document.getElementById("pumpstop").style.stopColor= "rgb("+pumpColor+")";
	document.getElementById("puckstop").style.stopColor= "rgb("+puckColor+")";

	//set restrictor size
	var restrictorSize=12.12*(100-(FlowRestrictorResistance*18))/100

	document.getElementById("restrictangle").style.height= restrictorSize;
	document.getElementById("restrictangle").style.y=176.73-restrictorSize/2;
	
	dropNumber();
}

function dropNumber() {
	
	let flowScaling= Math.floor(10*parseFloat(jQuery('#SlideFlow').val()));
	if (flowScaling > 99) {
		flowScaling = 99
	}

	for (let r = 0; r < flowScaling; r++) {
		document.getElementById(["dropPath"+r]).style.display="inline"
	}

	for (let r = flowScaling; r < 100; r++) {
		document.getElementById(["dropPath"+r]).style.display="none"
	}
	
}	

function drawDrops() {
	var droplets=100
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

function flowChange() {
	var PumpPressure= parseFloat(jQuery('#SlidePumpPressure').val())
	var PuckPressure= parseFloat(jQuery('#SlidePuckPressure').val())
	var FlowRestrictorResistance= parseFloat(jQuery('#SlideFlowRestrictorResistance').val())
	var PuckResistance= parseFloat(jQuery('#SlidePuckResistance').val())
	var Flow= parseFloat(jQuery('#SlideFlow').val())

		//since max slider value of flow is 15, this calculates pressure at this flow rate
	var totalResistance=PuckResistance+FlowRestrictorResistance
	PumpPressure = Flow*totalResistance
	PuckPressure = PuckResistance*Flow

		//adjust pressure values to compensate
	jQuery('#SlidePumpPressure').slider('setValue', PumpPressure);
	jQuery('#SlidePuckPressure').slider('setValue', PuckPressure);

	updateDisplay();
}

function switchDiagram() {
		document.getElementById('machinewrapper').style.visibility='visible'
		document.getElementById('graphwrapper').style.visibility='hidden'
		document.getElementById('pumpcheckmark').style.visibility='hidden'
		document.getElementById('puckcheckmark').style.visibility='hidden'
		document.getElementById('restrictorcheckmark').style.visibility='hidden'
		document.getElementById('resistancecheckmark').style.visibility='hidden'
		document.getElementById('flowcheckmark').style.visibility='hidden'

		document.getElementById('pumpcheckcontainer').style.pointerEvents='none'
		document.getElementById('puckcheckcontainer').style.pointerEvents='none'
		document.getElementById('restrictorcheckcontainer').style.pointerEvents='none'
		document.getElementById('resistancecheckcontainer').style.pointerEvents='none'
		document.getElementById('flowcheckcontainer').style.pointerEvents='none'
}

function switchGraph() {
		document.getElementById('machinewrapper').style.visibility='hidden'
		document.getElementById('graphwrapper').style.visibility='visible'
		document.getElementById('pumpcheckmark').style.visibility='visible'
		document.getElementById('puckcheckmark').style.visibility='visible'
		document.getElementById('restrictorcheckmark').style.visibility='visible'
		document.getElementById('resistancecheckmark').style.visibility='visible'
		document.getElementById('flowcheckmark').style.visibility='visible'

		document.getElementById('pumpcheckcontainer').style.pointerEvents='auto'
		document.getElementById('puckcheckcontainer').style.pointerEvents='auto'
		document.getElementById('restrictorcheckcontainer').style.pointerEvents='auto'
		document.getElementById('resistancecheckcontainer').style.pointerEvents='auto'
		document.getElementById('flowcheckcontainer').style.pointerEvents='auto'
}

function puckSim() {
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
		//ramp up steps
		puckResistanceData.push ([preinfuse, (res+baselineRes)*0.05])
		puckResistanceData.push ([preinfuse+0.5, (res+baselineRes)*.1])
		puckResistanceData.push ([preinfuse+1, (res+baselineRes)*.3])
		puckResistanceData.push ([preinfuse+1.5, (res+baselineRes)*.7])

		//shot flowing steps
	for (var i=0; i < (30-preinfuse); i+=0.5) {
		puckResistanceData.push ([i+preinfuse+2, res+baselineRes])
		var res=res*(0.7+Math.random()*.4)
	}


	var smoothPuckResistanceData = []
	var smoothData = Smooth(puckResistanceData)
	for (var i=0; i < 60; i+=0.1) {
		smoothPuckResistanceData.push (smoothData(i))
	}
	

	return smoothPuckResistanceData
}



function runShot() {


	
	//set switch to stop
	document.getElementById('Simulate').innerHTML="Stop"
	document.getElementById('Simulate').setAttribute('onclick', 'stopShot()')


	clearTimeout(shotTimeout);
	var currentTicks=0;
	var puckResistanceGraphData=puckSim();
	

	iterate();


	function nextData() {

		//update resistance slider and recalculate all values
		var currentPuckResist=puckResistanceGraphData[currentTicks];
		jQuery('#SlidePuckResistance').slider('setValue', parseFloat(currentPuckResist[1]));
		puckResistance();
		
		//read new values off sliders and create datapoints
		var currentPuckPressure=[(currentTicks/20), parseFloat(jQuery('#SlidePuckPressure').val())]
		var currentPumpPressure=[(currentTicks/20), parseFloat(jQuery('#SlidePumpPressure').val())]
		var currentFlowRestrictorResistance=[(currentTicks/20), parseFloat(jQuery('#SlideFlowRestrictorResistance').val())]
		var currentFlow=[(currentTicks/20), parseFloat(jQuery('#SlideFlow').val())]

		//add values to graph
		puckResistanceGraph.push(currentPuckResist)
		puckPressureGraph.push(currentPuckPressure)
		pumpPressureGraph.push(currentPumpPressure)
		flowRestrictorGraph.push(currentFlowRestrictorResistance)
		flowGraph.push(currentFlow)

		

		//increment timer
		currentTicks+=1
	} 

	function drawDatapoint() {
		nextData();
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
		if (currentTicks > 599) {
		stopShot()
		} else {
		drawDatapoint();
		shotTimeout=setTimeout(iterate,45)
		}
	}
}

function stopShot () {
	clearTimeout(shotTimeout)

	document.getElementById('Simulate').innerHTML="Start"
	document.getElementById('Simulate').setAttribute('onclick', 'runShot()')
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


function clearGraph() {
	clearTimeout(shotTimeout)
	puckResistanceGraph=[0,0], puckPressureGraph=[], pumpPressureGraph=[], flowRestrictorGraph=[],flowGraph=[];
	oldpuckResistanceGraph=[], oldpuckPressureGraph=[], oldpumpPressureGraph=[], oldflowRestrictorGraph=[], oldflowGraph=[];


	document.getElementById('Simulate').innerHTML="Start"
	document.getElementById('Simulate').setAttribute('onclick', 'runShot()');
	var temp=plot.getData();
	for (i=0; i<temp.length; i++){
	temp[i].data = [0,0]
	}
	
	plot.setData(temp);
	plot.draw()
}

function toggleSeries (seriesIdx, seriesIdy) {
	var someData = plot.getData();
	someData[seriesIdx].lines.show = !someData[seriesIdx].lines.show;
	someData[seriesIdy].lines.show = !someData[seriesIdy].lines.show;

	plot.setData(someData);
	plot.draw();
}
