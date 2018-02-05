#include <Wire.h>
#include <VL53L0X.h>
#include <math.h>

VL53L0X sensor1;
VL53L0X sensor2;
VL53L0X sensor3;

#define sensor_pin1 4
#define sensor_pin2 5
#define sensor_pin3 6


//address number of 43 is prohibited
#define newAddress1 41
#define newAddress2 42 //for sensor number 2
#define newAddress3 44 //for sensor number 2

float SensorL;
float SensorR;

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
  
  sensor1.startContinuous();
  sensor2.startContinuous();
  sensor3.startContinuous();
}

void loop()
{
  SensorL = analogRead(A0);
  SensorR = analogRead(A1);
  
  Serial.print(sensor3.readRangeContinuousMillimeters());
  Serial.print(',');
  Serial.print(sensor2.readRangeContinuousMillimeters());
  Serial.print(',');
  Serial.print(sensor1.readRangeContinuousMillimeters());
  Serial.print(',');
  Serial.print(SensorL);
  Serial.print(',');
  Serial.print(SensorR);
  Serial.println();
}
