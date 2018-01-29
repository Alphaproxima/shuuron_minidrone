/* This example shows how to use continuous mode to take
range measurements with the VL53L0X. It is based on
vl53l0x_ContinuousRanging_Example.c from the VL53L0X API.

The range readings are in units of mm. */

#include <Wire.h>
#include <VL53L0X.h>
#include <MsTimer2.h>
#include <TimerOne.h>

VL53L0X sensor1;
VL53L0X sensor2;
VL53L0X sensor3;

//laser sensor pin
#define sensor_pin1 4
#define sensor_pin2 5
#define sensor_pin3 6

//define new address 
//address number of 43 is prohibited
#define newAddress1 41
#define newAddress2 42 //for sensor number 2
#define newAddress3 44 //for sensor number 2

// Light sensor
bool flagPWM = false, flagLED = false;
long count = 0;
int leftSensor = A2;
int rightSensor = A3;

void test() {
  flagPWM = !flagPWM;
  if (flagLED) {
    if (flagPWM)
      digitalWrite(9, HIGH);
    else
      digitalWrite(9, LOW);
  }
  else
    digitalWrite(9, LOW);

  /*For the test: 1s pikapika.*/
  if (count++ > 12500) {
    count = 0;
    flagLED = !flagLED;
  }
}

void setup()
{
  pinMode(sensor_pin1, OUTPUT);
  pinMode(sensor_pin2, OUTPUT);
  pinMode(sensor_pin3, OUTPUT);
  
  Serial.begin(9600);
  
  Wire.begin();

  sensor1.setAddress(newAddress1);
  pinMode(sensor_pin1, INPUT);
  delay(10);

  sensor2.setAddress(newAddress2);
  pinMode(sensor_pin2, INPUT);
  delay(10);

  sensor3.setAddress(newAddress3);
  pinMode(sensor_pin3, INPUT);
  delay(10);
  
  sensor1.init();
  sensor2.init();
  sensor3.init();

  sensor1.setTimeout(500);
  sensor2.setTimeout(500);
  sensor3.setTimeout(500);
  
  // Start continuous back-to-back mode (take readings as
  // fast as possible).  To use continuous timed mode
  // instead, provide a desired inter-measurement period in
  // ms (e.g. sensor.startContinuous(100)).
  sensor1.startContinuous();
  sensor2.startContinuous();
  sensor3.startContinuous();

  //timer1
  pinMode(9, OUTPUT);
  Timer1.initialize(64);
  Timer1.attachInterrupt(test);
  Timer1.start();
  
}

void loop()
{
//  Serial.print(sensor.readRangeContinuousMillimeters());
// if (sensor.timeoutOccurred()) { Serial.print(" TIMEOUT"); }
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
//  Serial.print(x);
//  Serial.print(',');
//  Serial.print(y);
//  Serial.print(',');
  Serial.print(sensor3.readRangeContinuousMillimeters());
  Serial.print(',');
  Serial.print(sensor2.readRangeContinuousMillimeters());
  Serial.println(',');
  Serial.print(sensor1.readRangeContinuousMillimeters());
  Serial.println();
}
