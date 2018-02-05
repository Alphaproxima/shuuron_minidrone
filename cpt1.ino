#include <Wire.h>

float sensorR;
float sensorL;
int i = 0;
unsigned long btime;
unsigned long atime;
unsigned long interval=1;

// ARX Parameter
double a1 = -0.981;
double a2 = 0.01653;
double b0 = 0.2833;
double b1 = -0.2706;

double thresholdR = 0.033;
double thresholdL = 0.033;

//Moving average filter 
#define yNUM 5
#define ma_yNUM 3
#define dyNUM 2
#define uNUM 5
#define ma_uNUM 5

//ARX variable for the model
// Left sensor
double yL[yNUM] = [0,0,0,0,0];
double ma_yL[ma_yNUM] = [0,0,0];
double dyL[dyNUM] = [0,0];
double uL[uNUM] = [0,0,0,0,0];
double ma_uL[ma_uNUM] = [0,0,0,0,0];

//Right sensor
double yR[yNUM] = [0,0,0,0,0];
double ma_yR[ma_yNUM] = [0,0,0];
double dyR[dyNUM] = [0,0];
double uR[uNUM] = [0,0,0,0,0];
double ma_uR[ma_uNUM] = [0,0,0,0,0];

#define oTH 10

//CPT parameters
int cnt = 0;
int dir = 0;
int rfnc = 0;
int state;
int flag = 0;

const int STATE0 = 0; //stay
const int STATE1 = 0; //surge
const int STATE2 = 0; //zigzag
const int STATE3 = 0; //zigzag
const int STATE4 = 0; //zigzag
const int STATE5 = 0; //loop

void sensing(){
  
  for(i = 4; i >= 0; i--){
    yR[i+1] = yR[i];
    yL[i+1] = yL[i];
  }
  yR[0] = sensorR; //voltage
  yL[0] = sensorL; //voltage

  //Moving average filter
  for(i = 1; i >= 0; i--){
    ma_yR[i+1] = ma_yR[i];
    ma_yL[i+1] = ma_yL[i];
  }
  ma_yR[0] = (yR[0]+yR[1]+yR[2]+yR[3]+yR[4])/5.0;
  ma_yL[0] = (yL[0]+yL[1]+yL[2]+yL[3]+yL[4])/5.0;
  
  for(i = 1; i>= 0; i--){
    dyR[i] = (ma_yR[i] - ma_yR[i+1])/interval *1000;
    dyL[i] = (ma_yL[i] - ma_yL[i+1])/interval *1000;
  }
  
  for(i = 4; i >= 0; i--){
    uR[i+1] = uR[i];
    uL[i+1] = uL[i];
  }
  //Pass through model
  uR[0] = -a1 * uR[1] - a2 * uR[2] + b0 * dyR[3] + b1 * dyR[4];
  uL[0] = -a1 * uL[1] - a2 * uL[2] + b0 * dyL[3] + b1 * dyL[4];
  
  for(i = 4; i >= 0; i--){
    ma_uR[i+1] = ma_uR[i];
    ma_uL[i+1] = ma_uL[i];
  }
  //moving average
  ma_uL[0] = (uL[0]+uL[1]+uL[2]+uL[3]+uL[4])/5.0;
  ma_uR[0] = (uR[0]+uR[1]+uR[2]+uR[3]+uR[4])/5.0;
  
  if(ma_uR[0]>thresholdR && ma_uR<0.2){
    dir = 1;
    state = STATE1;
    cnt = 0;
  }

  if(ma_uL[0]>thresholdL && ma_uL<0.2){
    dir = 0;
    state = STATE1;
    cnt = 0;
  }
}


void setup() {
  // put your setup code here, to run once:

}

void loop() {
  sensorL = analogRead(A0)*0.0049;
  sensorR = analogRead(A1)*0.0049;

}
