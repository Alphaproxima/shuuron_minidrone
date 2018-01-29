#include <Wire.h>
#include <VL53L0X.h>

VL53L0X sensor1;
VL53L0X sensor2;

#define sensor_pin1 4
#define sensor_pin2 5

#define newAddress1 41
#define newAddress2 42 //for sensor number 2

void setup()
{
  pinMode(sensor_pin1, OUTPUT);
  pinMode(sensor_pin2, OUTPUT);

  Serial.begin(9600);

  Wire.begin();

  sensor1.setAddress(newAddress1);
  pinMode(sensor_pin1, INPUT);
  delay(10);

  sensor2.setAddress(newAddress2);
  pinMode(sensor_pin2, INPUT);
  delay(10);

  sensor1.init();
  sensor2.init();

  sensor1.setTimeout(500);
  sensor2.setTimeout(500);

  sensor1.startContinuous();
  sensor2.startContinuous();
}

void loop()
{
  Serial.print(sensor1.readRangeContinuousMillimeters());
  Serial.print(',');
  Serial.print(sensor2.readRangeContinuousMillimeters());
  Serial.println();
  
}
