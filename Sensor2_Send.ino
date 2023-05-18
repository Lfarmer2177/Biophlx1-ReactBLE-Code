//let's say you want to read up to 100 values
#include "math.h"
#include "SparkFun_BNO080_Arduino_Library.h"

BNO080 myIMU;
#include <esp_now.h>
#include <WiFi.h>



const unsigned int numReadings = 5;
float analogVals[numReadings];

unsigned int i = 0;


int prev_position = 0;
int prev_state = 0;
int current_state;
int current_position;
int limit_one;
float prev_score = 0;
int y = 0;
int valueHigh = 30;
int valueHigh2  = 0;
int myDrop[2];
float rep = 0;
float total_rep = 0;
int reps_complete;
float completion_rep;
int depth = 0;
int total_depth = 0;
int avg_depth = 0;


float velocity_y = 0.00;
float y_velocity = 0.00;

int drop_distance = 0;

//Register Averages of Velocity
int rep_number = 0;
const unsigned int numReadings2 = 10;
float velocity_reads[numReadings2];

float total = 0; 
float average = 0;  //Average Acceleration

float prev_velocity  = 0;  //Rep Acceleration
int current_state2;
int prev_state2 = 0;

float prev_time =0.00;
unsigned long timers;
float total_down_time=0.00;
float prev_total_down_time = 0.00;  //Time Under Tension
float current_time=0.00;


float score = 0;  //Rep Score
float total_score = 0;  
String set_rating;
String score_rep;
float average_score = 0;  //Score Average

int score_status_pos;
int score_status_neg = 0;
float rep_show = 0.00;

int set_count;
int residual;

float sets_complete;
float sets_complete2;



//Send This Data to Board #1///////
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};
typedef struct struct_message {
    int id;
    float average_acceleration; // must be unique for each sender board
    float rep_acceleration;
    float tension_time;
    float rep_score;
    float set_score;
    float completion_rep;
    float sets_complete;
    int rep;
    int current_state;
    int prev_state;
    int depth;
    int avg_depth;
} struct_message;

//////Receive this Data////////////////////////

typedef struct struct_message2 {
   int id;
  int weight;
  int body_weight;
  int gender;
  int reps;
  int sets;
  int work_type;
  int humerus;
  int forearm;
  int femur;
  int tibia;
  int torso;
  int age;
}struct_message2;

struct_message performance;

struct_message2 myData;

esp_now_peer_info_t peerInfo;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));

}



void setup()
{
  Serial.begin(115200);
  Wire.begin();
 myIMU.begin(0x4B);
 Wire.setClock(400000);
  myIMU.enableRotationVector(5);
  myIMU.enableGyro(15);
  pinMode(13, OUTPUT);
  pinMode(25, OUTPUT);
  pinMode(12, OUTPUT);
    WiFi.mode(WIFI_STA);

    if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

    esp_now_register_send_cb(OnDataSent);

  // Register peer
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  // Add peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }

  esp_now_register_recv_cb(OnDataRecv);

  
}

void loop()
{
  current_state = digitalRead(13);
  current_state2 = digitalRead(12);
  if (myIMU.dataAvailable() == true)
  {
    
    int x = abs((myIMU.getRoll()) * 180.0 / PI);
    y = abs(((myIMU.getPitch())) * (180.0 / PI)-90);
    int z = abs((myIMU.getYaw()) * 180.0 / PI);
    velocity_y = abs(myIMU.getGyroY());
  }

//   if(myData.work_type == 1){

  current_position = y;

  if (current_position > prev_position) {

prev_position = current_position;
  }

  prev_score = score;


  if (current_position < prev_position){
 limit_one = prev_position - current_position;
 
if(valueHigh <= limit_one){
  valueHigh = limit_one;
   
  if(valueHigh2 < valueHigh){
    valueHigh2 = limit_one;
   myDrop[1] = valueHigh;
   

   if(myDrop[1] > myDrop[0]){
  myDrop[0] = myDrop[1];
   }

   
   

  if(myDrop[0] > 30 && myDrop[0] <= 60){
    score = 100;
    score_rep = "Poor";

  
  }

  if(myDrop[0] > 60 && myDrop[0] <= 70){
    score = 200;
    score_rep = "Ok";
  }

  if(myDrop[0] > 70 && myDrop[0] <= 85){
    score = 400;
    score_rep = "Good";
  }

  if(myDrop[0] > 85){
    score = 500;
    score_rep = "Great";
  }



  }
  else if(valueHigh = 30){
    valueHigh2 = 0;
  }


}
else{
  valueHigh = 30;
  total_score = total_score + 0;
  
 }

if( myDrop[0] > 0){
  depth = myDrop[0];
}
 if(limit_one < 30){
  myDrop[0] = 0;
 }

if(valueHigh <= limit_one){
digitalWrite(13, HIGH);
digitalWrite(25, HIGH);
}
 else{
  digitalWrite(13, LOW);
  digitalWrite(25, LOW);
 }


  }

  drop_distance = myDrop[0] - limit_one;
  

 
velocity_reads[1] =  prev_velocity;
 


if(current_state != prev_state && current_state == LOW){
    rep = rep+1;
    
    
  }

  prev_state = current_state;


  total_rep = rep;
  reps_complete = round(total_rep);
  

  


  static uint32_t tStart = millis(); // ms; start time
  const uint32_t DESIRED_PERIOD = 10; // ms
  uint32_t tNow = millis(); // ms; time now
  if (tNow - tStart >= DESIRED_PERIOD)
  {
    tStart += DESIRED_PERIOD; // update start time to ensure consistent and near-exact period

//    Serial.println("taking sample");
    
  
    if(myDrop[0] > 50 && drop_distance <= 30){
    
      prev_velocity = velocity_y;
      velocity_reads[1] = velocity_reads[0];
      y_velocity = velocity_y *1.00;
      i++;
       digitalWrite(12, HIGH);
          if (i>=numReadings)
    {
      i = 0; //reset to beginning of array, so you don't try to save readings outside of the bounds of the array
    }
    }
    else{
   

  // After the first pass, sum hold the correct value, that is good.

digitalWrite(12, LOW);
}
  
    
   
     
     
    }



 
   // velocity_reads[1] = prev_velocity;

    if(current_state2 == LOW && prev_state2 == HIGH  && prev_velocity > 0){
  total = total + prev_velocity;
  // advance to the next position in the array:
 
  }

  current_time = timers/1000.0;
  timers = millis();

  if(current_state == LOW){

    prev_time = current_time;

    
    
  }


  
if(current_state2 == LOW && prev_state2 == HIGH){
  total_score = total_score + score;
  total_depth = total_depth + depth; 
}


  total_down_time = current_time - prev_time;

  if(total_down_time > 0){

    prev_total_down_time = total_down_time;
    
  }

  if (rep_number >= numReadings2) {
    // ...wrap around to the beginning:
    rep_number = 0;
  }

  average = total / total_rep;
  average_score = total_score/ total_rep;

  if(total_rep > 1){
  avg_depth = total_depth/total_rep;
  };

    
    prev_state2 = current_state2;
    rep_show = float(myData.reps);


if(myData.sets > 0 &&   myData.reps > 0){


  sets_complete = (float(reps_complete) / (float(myData.sets) * float(myData.reps)));

  residual = reps_complete/myData.reps;
  sets_complete2 = (float(reps_complete) -  (float(myData.reps) * round(float(residual))) ) /float(myData.reps);

if(residual < 0 || sets_complete2 == 0.00){
  completion_rep = (total_rep/rep_show)*100;

  if(sets_complete2 == 0.00 && residual > 0){
    completion_rep = ((total_rep/rep_show)*100)/round(residual);
  }
}else{
    completion_rep = (sets_complete2*100);

  }



}

  
    

    performance.id = 2;
    performance.average_acceleration = average;
    performance.rep_acceleration = velocity_reads[1];
    performance.tension_time = prev_total_down_time;
    performance.rep_score = score;
    performance.set_score = average_score;
    performance.rep = reps_complete;
    performance.current_state = current_state;
    performance.prev_state = prev_state;
    performance.completion_rep = completion_rep;
    performance.sets_complete = sets_complete;
    performance.depth = depth;
    performance.avg_depth = avg_depth;

 esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &performance, sizeof(struct_message));
   
  if (result == ESP_OK) {
    Serial.println("Sent with success");
  }
  else {
    Serial.println("Error sending the data");
  }

  
//  
  Serial.println(y_velocity);
//  Serial.println(velocity_reads[1]);
//  Serial.println(reps_complete);
//  Serial.println(myData.work_type);

 
//  }


//  Serial.println(myData.sets);
//    Serial.println(analogVals[i]);
////
//if(velocity_y > 0.05){
//  Serial.println(average);
//}

//Serial.println(myDrop[0]);
Serial.println(avg_depth);
Serial.println(total_depth);
//  
//  Serial.println(myDrop[0]);
//    Serial.println(valueHigh);
//      Serial.println(depth);
//      Serial.println(average_score);
//  Serial.println(prev_total_down_time);


}
