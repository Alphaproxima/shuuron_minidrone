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

	var ff = speed_gain/(1+math.exp(-0.02*(frontsensor - 400)));
	var fl = speed_gain/(1+math.exp(-0.02*(leftsensor - 400)));
	var fr = speed_gain/(1+math.exp(-0.02*(rightsensor - 400)));
//	console.log(datum);
	if(stflag == 1)
	{
		if(leftsensor < 400 || rightsensor < 400){
			d.XYZ({speed_X:fr-fl,speed_Y:ff,speed_Z:0,speed_omega:0});	
			cooldown();
		}
		if(frontsensor < 400){
			//var rnd_R = (Math.random()*fr);
			//var rnd_L = (Math.random()*fl);
			d.XYZ({speed_X:fr-fl,speed_Y:0,speed_Z:0,speed_omega:0});	
			cooldown();
			if(fr > fl){
				d.XYZ({speed_X:(1.5*fr)-(0*fl),speed_Y:0,speed_Z:0,speed_omega:0});	
				cooldown();
			}
			else if(fr < fl){
				d.XYZ({speed_X:(0*fr)-(1.5*fl),speed_Y:0,speed_Z:0,speed_omega:0});	
				cooldown();
			}
			//when fr == fl we choose to random action
			else{
				var rnd = ((Math.random()*fr)-(Math.random()*fl));
				d.XYZ({speed_X:1.5*((Math.random()*fr)-(Math.random()*fl)),speed_Y:0,speed_Z:0,speed_omega:0});
			//	console.log(rnd);
			//	d.XYZ({speed_X:1.5*fr,speed_Y:0,speed_Z:0,speed_omega:0});	
				cooldown();
			}
		}
		else{
			//d.XYZ({speed_X:0,speed_Y:ff,speed_Z:0,speed_omega:0});	
			//cooldown();
      
      //update behavior
		if(stflag==1){
			cnt=cnt+1;
			switch (state){
				case STATE0:
				break;
				
				case STATE1:
					if(cnt == 15){
					state = STATE2;
					cnt = 0;
				}
				break;
				
				case STATE2:
				if(cnt == 36){
					state = STATE3;
					if(dir==0) dir=1;
					else dir = 0;
					cnt = 0;
				}
				break;
				
				case STATE3:
				if(cnt == 57){
					state = STATE4;
					if(dir==0)dir = 1;
					else dir = 0;
					cnt = 0;					
				}
				break;
				
				case STATE4:
				if(cnt == 64){
					state = STATE5;
					if(dir == 0) dir=1;
					else dir=0;
					cnt =0;
				}
				break;
				
				case STATE5:
				if(cnt == 109){
					state=STATE2;
					if(dir ==0) dir =1;
					else dir = 0;
					cnt =0;
				}
				break;
			}
			
			switch (state){
				case STATE0:
				led1.off();
				led2.off();
				break;
				
				case STATE1:
				led1.on();
				led2.on();
				d.XYZ({speed_X:0,speed_Y:25,speed_Z:0,speed_omega:0});
				cooldown();
				break;
				
				case STATE2:
				case STATE3:
				case STATE4:
				case STATE5:
				if(dir == 0){
					led1.on();
					led2.off();
					
					//turn left
					d.XYZ({speed_X:0,speed_Y:0,speed_Z:0,speed_omega:30});
					cooldown();
				}
				else if(dir == 1){
					led1.off();
					led2.on();
					
					//turn right
					d.XYZ({speed_X:0,speed_Y:0,speed_Z:0,speed_omega:-30});
					cooldown();
				}
				break;
			}
		}
		else {
			state = STATE0;
		}
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
