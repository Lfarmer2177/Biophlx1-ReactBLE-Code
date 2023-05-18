#include <HardwareSerial.h>
#include <Wire.h> 
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <ArduinoJson.h>

HardwareSerial SerialPort(2); // use UART2


char number  = ' ';
int LED = 13;
char myFloatStr[10];
float myFloat;
String time1;
char txString[12];
float previousValue;
float value1 = 0;





const std::string serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const std::string characteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;

void onConnect(BLEServer* pServer) {
    // Start advertising
    pServer->getAdvertising()->start();
    Serial.println("Connected");
}

void onDisconnect(BLEServer* pServer) {
    // Stop advertising
    pServer->getAdvertising()->stop();
    Serial.println("Disconnected");
    // Restart advertising
    pServer->getAdvertising()->start();
}


class MyCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    if (value.length() > 0) {
      Serial.println("*********");
      Serial.print("New value: ");
      for (int i = 0; i < value.length(); i++) {
        Serial.print(value[i]);
      }
      Serial.println();
      Serial.println("*********");
      
    }
  }
};

StaticJsonDocument<200> json;
char buffer[400];


void setup()
{
    Serial.begin(115200);
  SerialPort.begin(15200, SERIAL_8N1, 16, 17);
  pinMode(LED, OUTPUT);
  Serial.println("Starting BLE work!");

   BLEDevice::init("My BLE Server");
  pServer = BLEDevice::createServer();
  BLEService* pService = pServer->createService(serviceUUID);
  pCharacteristic = pService->createCharacteristic(
    characteristicUUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
     BLECharacteristic::PROPERTY_NOTIFY 
     //BLECharacteristic::PROPERTY_INDICATE
  );

   BLEDescriptor *pClientCharacteristicConfigDescriptor = new BLEDescriptor((uint16_t)0x2902);
  pCharacteristic->addDescriptor(pClientCharacteristicConfigDescriptor);

  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue("0");
  //pCharacteristic->notify();
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("Characteristic defined!");
}
void loop()
{
  if (SerialPort.available())
  {
    digitalWrite(LED, HIGH);
    
  String dataReceived = SerialPort.readStringUntil('\n');

    // Parse JSON string to JSON object
    
    DeserializationError error = deserializeJson(json, dataReceived);
           Serial.println(dataReceived.length());
           Serial.println(dataReceived);
           


      if (dataReceived.length() < 200 && dataReceived.length() >180) {
        
        pCharacteristic->notify(); // Notify the new value
      
//            Serial.print("Value 1: ");
//  Serial.println(txString);
//      Serial.print("Value 2: ");
//      Serial.println(value2);
//       Serial.println(value1);
      }
//      else{
////        Serial.print("Value 1: ");
////  Serial.println(txString);
////      Serial.print("Value 2: ");
////      Serial.println(value2);
////       Serial.println(value1);
//        
//      }

   Serial.print("Devices Connected:");
  Serial.print(pServer->getConnectedCount() > 0);
  if (pServer->getConnectedCount() > 0) {

        
        
        
        //temperature = my_sensor.readTemperature();
        serializeJson(json, buffer);
      //  dtostrf( value1, 1, 2, txString);
    //    temperature = temperature + 1.00;
      //  dtostrf(temperature, 1, 2, txString);
      //  pCharacteristic->setValue(txString);
      pCharacteristic->setValue(buffer);
      
        pCharacteristic->notify();
        
    } else {
     
      Serial.println("No device connected and looking for one");
            // Stop advertising
            pServer->getAdvertising()->stop();
            Serial.println("Disconnected");
            
            // Restart advertising

            //pService->start();
            pServer->getAdvertising()->start();
            Serial.println("Characteristic defined!");
        
        //delay(5000);
    }
  // You can send data to the React Native application
  // by writing to the characteristic






    

//  Serial.println(floatValue1);
//  
//      Serial.print("Value 1: ");
//      Serial.println(value1);
//      Serial.print("Value 2: ");
//      Serial.println(value2);

}
delay(100);
}
