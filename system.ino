/* This example shows how to use continuous mode to take
range measurements with the VL53L0X. It is based on
vl53l0x_ContinuousRanging_Example.c from the VL53L0X API.

The range readings are in units of mm. */

#include <Wire.h>
#include <VL53L0X.h>
#include <MsTimer2.h>
#include <TimerOne.h>

VL53L0X sensor;

// Light sensor
bool flagPWM = false, flagLED = false;
long count = 0;
int leftSensor = A2;
int rightSensor = A3;

void test() {
  flagPWM = !flagPWM;
  if (flagLED) {
    if (flagPWM)
      digitalWrite(5, HIGH);
    else
      digitalWrite(5, LOW);
  }
  else
    digitalWrite(5, LOW);

  /*For the test: 1s pikapika.*/
  if (count++ > 12500) {
    count = 0;
    flagLED = !flagLED;
  }
}
void setup()
{
  Serial.begin(9600);
  Wire.begin();
  sensor.init();
  sensor.setTimeout(500);

  // Start continuous back-to-back mode (take readings as
  // fast as possible).  To use continuous timed mode
  // instead, provide a desired inter-measurement period in
  // ms (e.g. sensor.startContinuous(100)).
  sensor.startContinuous();

  //timer1
  pinMode(5, OUTPUT);
  Timer1.initialize(64);
  Timer1.attachInterrupt(test);
  Timer1.start();
  
}

void loop()
{
//  Serial.print(sensor.readRangeContinuousMillimeters());
  if (sensor.timeoutOccurred()) { Serial.print(" TIMEOUT"); }

//  Serial.println();
 
  int x = analogRead(leftSensor);
  int y = analogRead(rightSensor);

/*  String temp = "{\"x\":\"";
//    temp += x;
//    temp +="\",\"y\":\"";
    temp += y;
    temp +="\",\"z\":\"";
    temp += sensor.readRangeContinuousMillimeters();
    temp +="\"}";
*/
  Serial.print(x);
  Serial.print(",");
  Serial.print(y);
  Serial.print(",");
  Serial.print(sensor.readRangeContinuousMillimeters());
  Serial.println(",");
}
