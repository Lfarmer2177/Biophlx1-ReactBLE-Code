#include <HardwareSerial.h>
#include <esp_now.h>
#include <WiFi.h>
#include <ArduinoJson.h>

float myFloat;
char myFloatStr[10];
float floatValue1 = 1.23;
float floatValue2 = 4.56;
char txString[12];
int value5 = 0;

int rep;
int previousValue;



HardwareSerial SerialPort(2); // use UART2

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
//
// Create a struct_message called myData
struct_message performance;

// Create a structure to hold the readings from each board
struct_message board1;
struct_message board2;
struct_message board3;

// Create an array with all the structures
struct_message boardsStruct[3] = {board1, board2, board3};


// callback function that will be executed when data is received
void OnDataRecv(const uint8_t * mac_addr, const uint8_t *incomingData, int len) {
  char macStr[18];
 
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
//Serial.println(macStr);
  memcpy(&performance, incomingData, sizeof(performance));

  // Update the structures with the new incoming data
//  Serial.printf("board id: %u: %u bytes\n", performance.id, len);
   boardsStruct[performance.id-1].id = performance.id;
  boardsStruct[performance.id-1].average_acceleration = performance.average_acceleration;
  boardsStruct[performance.id-1].tension_time = performance.tension_time;
  boardsStruct[performance.id-1].rep_score = performance.rep_score;
  boardsStruct[performance.id-1].rep_acceleration = performance.rep_acceleration;
  boardsStruct[performance.id-1].set_score = performance.set_score;
  boardsStruct[performance.id-1].rep = performance.rep;
  boardsStruct[performance.id-1].sets_complete = performance.sets_complete;
  boardsStruct[performance.id-1].current_state = performance.current_state;
  boardsStruct[performance.id-1].prev_state = performance.prev_state;
  boardsStruct[performance.id-1].depth = performance.depth;
  boardsStruct[performance.id-1].avg_depth = performance.avg_depth;
  
}
void setup()  
{
  SerialPort.begin(15200, SERIAL_8N1, 16, 17); 
  Serial.begin(115200);                               // init serial port for debugging
WiFi.mode(WIFI_STA);

   if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  esp_now_register_recv_cb(OnDataRecv);

} 



void loop()  
{ 


  

  // Create JSON object and add data
  StaticJsonDocument<200> json;
  json["value1"] = dtostrf( performance.tension_time, 1, 2, txString);  //Time Under Tension
  json["value2"] = dtostrf( performance.rep_acceleration, 1, 2, txString); //Rep Acceleration
  json["value3"] = performance.depth; //Joint Range of Motion
  json["value4"] = dtostrf( performance.average_acceleration, 1, 2, txString); //Avg. Acceleration
  json["value5"] = performance.rep; //Reps Completed
  json["value6"] = performance.avg_depth; //Avg. Range of Motion

  // Serialize JSON object to string
  char dataSend[400];
  serializeJson(json, dataSend);
  
if (value5 != performance.rep) {
        previousValue =  performance.rep;
  // Send JSON string via UART
  SerialPort.println(dataSend);


  Serial.println(dataSend);


  }
  
  delay(100);


}
