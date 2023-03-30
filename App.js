import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Dimensions } from 'react-native';
// import DatePicker from 'react-native-date-picker';
import React, { useState, useEffect } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import {LogBox} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";



LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications


const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";



const serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const characteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const manager = new BleManager();

const BLEScreen = () => {
  const [device, setDevice] = useState(null);
  const [value, setValue] = useState(null);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);

    return () => {
      manager.destroy();
    };
  }, []);

  useEffect(() => {
  setValue(value);
}, [value]);

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        return;
      }

      if (scannedDevice.name === 'My BLE Server') {
        console.log('Found device:', scannedDevice.name);
        manager.stopDeviceScan();
        connectToDevice(scannedDevice);
      }
    });
  };

  const connectToDevice = (scannedDevice) => {
    console.log('Connecting to device:', scannedDevice.name);
    scannedDevice.connect()
      .then((connectedDevice) => {
        console.log('Connected to device:', connectedDevice.name);
        setDevice(connectedDevice);
        setupNotifications(connectedDevice);
        return device.discoverAllServicesAndCharacteristics();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const setupNotifications = (connectedDevice) => {
    console.log('Setting up notifications');
    connectedDevice.discoverAllServicesAndCharacteristics()
      device.readCharacteristicForService(serviceUUID, characteristicUUID)
            .then(valenc => {
              //console.log(valenc);
              //console.log(base64.decode(valenc.value))
              setValue(base64.decode(valenc.value));
            })
      .then((characteristics) => {
        const characteristic = characteristics.find((c) => c.uuid === CHARACTERISTIC_UUID);
        return characteristic.monitor((error, characteristic) => {
          if (error) {
            console.error(error);
            return;
          }

           if (characteristic.value != null) {
                  
                const setValue = base64.decode(characteristic.value);
                setValue(value);
           }

          
          
        });

      })
      .catch((error) => {
        console.error(error);
      });
  };

  const disconnect = () => {
    console.log('Disconnecting from device');
    device.cancelConnection()
      .then(() => {
        console.log('Disconnected from device');
        setDevice(null);
        setValue(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // const handleChange = (event) => {
  //   setValue(event.target.value);
  // };

  return (
    <View style={styles.container}>
      {device ? (
        <>
          <Text>Connected to {device.name}</Text>
          <Text>Value: {value}</Text>
          <Button title="Disconnect" onPress={disconnect} />
        </>
      ) : (
        <Button title="Connect" onPress={scanAndConnect} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    top: 35,
    right: 0,
    width: 120,
  },
});


export default BLEScreen;
