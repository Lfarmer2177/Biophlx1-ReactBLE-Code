#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
//#include <DHT.h>


float temperature = 0.0, humidity;




float random_num;


//DHT my_sensor(23, DHT22);

// Replace with the service and characteristic UUIDs used by your application
const std::string serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const std::string characteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;

//BLEServer *pServer = BLEDevice::createServer();
//BLEDevice::init("My BLE Server");
//BLEService* pService = pServer->createService(serviceUUID);
//pCharacteristic = pService->createCharacteristic(
//    characteristicUUID,
//    BLECharacteristic::PROPERTY_READ |
//    BLECharacteristic::PROPERTY_WRITE
//  );

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

void setup() {
  Serial.begin(115200);
//  my_sensor.begin();
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

//pServer->start();
//pServer->setConnectCallback(onConnect);
//pServer->setDisconnectCallback(onDisconnect);
}

void loop() {
  Serial.print("Devices Connected:");
  Serial.print(pServer->getConnectedCount() > 0);
  if (pServer->getConnectedCount() > 0) {
        Serial.println("Device connected");
        char txString[8];
        
        //random_num = random(100)/100.0;
        //temperature = my_sensor.readTemperature();
        //dtostrf(random_num, 1, 2, txString);
        temperature = temperature + 1.00;
        dtostrf(temperature, 1, 2, txString);
        pCharacteristic->setValue(txString);
        pCharacteristic->notify();
        Serial.println(temperature);
    } else {
      temperature = 0.0;
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
  delay(5000);
}
