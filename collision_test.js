// this programming code purpose is for take-off, landing, and avoiding the collision
// created by: Muhamad Rausyan Fikri - Tokyo Tech

'use strict';

var SerialPort = require('serialport');
// var five = require("johnny-five");
var keypress = require('keypress');
var RollingSpider = require("rolling-spider");
var math = require('mathjs');

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

var ACTIVE = true;
var STEPS = 5;
var speed_gain = 20;
var d = new RollingSpider({uuid:"c01229b61cbe"}); //rs drone
//var d = new RollingSpider({uuid:"e01428853dc1"}); // mars drone 
//var d = new RollingSpider({uuid:"e014c2d73d80"});

function cooldown() {
	ACTIVE = false;
	setTimeout(function (){
		ACTIVE = true;
	}, STEPS);
}

d.connect(function() {
	d.setup(function(){
		d.flatTrim();
		d.startPing();
		d.flatTrim();
		console.log('Configured for Rolling Spider! ', d.name);
		setTimeout(function(){
			console.log(d.name+ ' => SESSION START');
			ACTIVE = true;
		}, 1000);
	});
});

//var board = new five.Board({
//	port: "/dev/ttyMFD1"
//});

var cnt=0; //I would like to use this parameter for moving forward indicators
var stflag=0;

//timer
var start= new Date();
var end;
var executionTime;
const interval=33;

// moving parameter
var state;
var STATE0=0; //hovering
var STATE1=1; //Forward
var STATE2=2; //Moving

// state parameter
var dobs = 0; //parameter to turn on the drone

var port = new SerialPort('/dev/ttyMFD1',{
  baudRate: 9600,
//  parser: SerialPort.parsers.readline('\n')
});

port.on('open', function () {
  console.log('open');
  port.on('data', function(data) {
	var datum = data.toString('utf8').split(',');
	var frontsensor = datum[0]
	var rightsensor = datum[1]
	var leftsensor = datum[2]

	var ff = speed_gain/(1+math.exp(-0.02*(frontsensor - 500)));
	var fl = speed_gain/(1+math.exp(-0.02*(leftsensor - 500)));
	var fr = speed_gain/(1+math.exp(-0.02*(rightsensor - 500)));
//	console.log(datum);
	if(stflag == 1)
	{
		if(leftsensor < 500 || rightsensor <500){
			d.XYZ({speed_X:fr-fl,speed_Y:ff,speed_Z:0,speed_omega:0});	
			cooldown();
		}
		else if(frontsensor <500){
			d.XYZ({speed_X:fr-fl,speed_Y:0,speed_Z:0,speed_omega:0});	
			cooldown();
		}
		else{
			d.XYZ({speed_X:0,speed_Y:ff,speed_Z:0,speed_omega:0});	
			cooldown();
		}
	} // end of stflag
	  
	  // this for timer of the node.js
/*		end = new Date();  
		executionTime = end.getTime() - start.getTime();
		
		while(executionTime < interval) {
			end = new Date();
			executionTime = end.getTime() - start.getTime();
    	}
    	start = new Date(); */
	console.log(leftsensor, frontsensor, rightsensor, fl, ff, fr);

  });
});

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
	if (ACTIVE && key) {
		var param = {tilt:0, forward:0, turn:0, up:0};

		if (key.name === 'l') {
			console.log('land');
			d.land();
      	//		led1.off();
	//		led2.off();
      			stflag=0;
		} else if (key.name === 't') {
			console.log('takeoff');
			d.takeOff();
		} else if (key.name === 'h') {
			console.log('hover');
			d.hover();
			stflag = 0;
			cnt = 0;
		} else if (key.name === 'x') {
			console.log('disconnect');
			d.disconnect();
			process.stdin.pause();
			process.exit();
		}

		if (key.name === 'up') {
			d.forward({ steps: STEPS });
			cooldown();
		} else if (key.name === 'down') {
			d.backward({ steps: STEPS });
			cooldown();
		} else if (key.name === 'right') {
			d.tiltRight({ steps: STEPS });
			cooldown();
		} else if (key.name === 'left') {
			d.tiltLeft({ steps: STEPS });
			cooldown();
		} else if (key.name === 'w') {
			d.up({ steps: STEPS });
			cooldown();
		} else if (key.name === 's') {
			d.down({ steps: STEPS });
			cooldown();
		}

		if (key.name === 'a') {
			param.turn = 90;
			d.drive(param, STEPS);
			cooldown();
		}
		if (key.name === 'd') {
			param.turn = -90;
			d.drive(param, STEPS);
			cooldown();
		}
		if (key.name === 'f') {
			d.frontFlip();
			cooldown();
		}
		if (key.name === 'b') {
			d.backFlip();
			cooldown();
		}
		if (key.name === 'g') {
			stflag=1;
		}
   		 if (key.name === 'q') {
			state=STATE1;
			cnt = 0;
		}

	}
});
