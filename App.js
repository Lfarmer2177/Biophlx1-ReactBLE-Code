import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Dimensions } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useState } from 'react';
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


export const manager = new BleManager();

const serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const characteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let test  = [0,0,0,0,0]
let tempTemperatureArray = [0,0,0,0,0]
let temperatureArray = [0,0,0,0,0]

export default function App() {

  //const [temperatureArray, setTemperatureArray] = useState([])

  const [temperatureArrayLength, setTemperatureArrayLength] = useState(0); 

    //Is a device connected?
    const [isConnected, setIsConnected] = useState(false);

    //What device is connected?
    const [connectedDevice, setConnectedDevice] = useState();

    const [message, setMessage] = useState(0);

    //let [tempTemperatureArray, setTempTemperatureArray] = useState([0,0,0,0,0])

    
 

    
    


  const scanAndConnect = () => {
    console.log("I am Pushed")
    //const manager = new BleManager();
    manager.startDeviceScan(null, null, (error, device) => {
      console.log("starting Scan")
        if (error) {
            // Handle error (scanning will be stopped automatically)
            console.log("There is some error")
            //console.log(error)
            //console.log(device)
            console.log(JSON.stringify(error));
            //manager.stopDeviceScan();
            return
        }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        if (device.name === 'TI BLE Sensor Tag' || 
            device.name === 'My BLE Server') {
            
            // Stop scanning as it's not necessary if you are scanning for one device.
            manager.stopDeviceScan();
            console.log("Successflly cooneced")
            connectDevice(device)

        }

    });

    setTimeout(() => {
    manager.stopDeviceScan();
    }, 10000);

  }

    // handle the device disconnection (poorly)
    async function disconnectDevice() {
      console.log('Disconnecting start');
  
      if (connectedDevice != null) {
        const isDeviceConnected = await connectedDevice.isConnected();
        if (isDeviceConnected) {
          manager.cancelTransaction('messagetransaction');
          manager.cancelTransaction('nightmodetransaction');
  
          manager.cancelDeviceConnection(connectedDevice.id).then(() =>
            console.log('DC completed'),
          );
        }
  
        const connectionStatus = await connectedDevice.isConnected();
        if (!connectionStatus) {
          setIsConnected(false);
        }
      }
    }

    //Connect the device and start monitoring characteristics
    async function connectDevice(device) {
      console.log('connecting to Device:', device.name);
  
      device
        .connect()
        .then(device => {
          setConnectedDevice(device);
          setIsConnected(true);
          return device.discoverAllServicesAndCharacteristics();
        })
        .then(device => {
          //  Set what to do when DC is detected
          manager.onDeviceDisconnected(device.id, (error, device) => {
            console.log(device.name, ' is DC');
            setIsConnected(false);
          });
  
          //Read inital values
  
          //Message
          device
            .readCharacteristicForService(serviceUUID, characteristicUUID)
            .then(valenc => {
              console.log(valenc);
              console.log(base64.decode(valenc.value))
              setMessage(base64.decode(valenc.value));
              temperatureArray.push(base64.decode(valenc.value))
            });

          //monitor values and tell what to do when receiving an update
          //Message
          device.monitorCharacteristicForService(
            serviceUUID,
            characteristicUUID,
            (error, characteristic) => {
              if(error){
                console.log(error)
              }
              else if (characteristic?.value != null) {
                setMessage(base64.decode(characteristic.value));
                temperatureArray.push(base64.decode(characteristic.value));
                const now =new Date;
                console.log(
                  'Message update received:',
                  base64.decode(characteristic.value),
                  now.getHours(),":",now.getMinutes(),":",now.getSeconds().toString().padStart(2,'0')
                );
                //console.log("length of temperature array is: ", temperatureArray.length);
                if (temperatureArray.length % 5 === 0) {
                  //console.log("temperature array full, values are:", temperatureArray)
                  //console.log("last 5 elements are", temperatureArray.slice(Math.max(temperatureArray.length - 5, 0)))
                  test = temperatureArray.slice(Math.max(temperatureArray.length - 5, 0))
                  tempTemperatureArray = test;
                  //console.log("Plot values are", test, tempTemperatureArray)
                  //temperatureArray = [];
                }


              }
              else {
                console.log("I dont know why I am here")
              }
            },
            'messagetransaction',
          );
          console.log('Connection established');
        });   
    }

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <Text>Array Length is now: {temperatureArray.length}</Text>
      

      <TouchableOpacity style={styles.button}>
          {!isConnected ? (
            <Button
              title="Connect"
              onPress={() => {
                scanAndConnect();
              }}
              disabled={false}
            />
          ) : (
            <Button
              title="Disonnect"
              onPress={() => {
                disconnectDevice();
              }}
              disabled={false}
            />
          )}
        </TouchableOpacity>
        
        

        <Text>Line Chart</Text>

        <View>
  
  <LineChart
    data={{
      labels: ["January", "February", "March", "April", "May"],
      datasets: [
        {
          data: temperatureArray.length % 5 === 0 ? test : tempTemperatureArray //test //temperatureArray.slice(Math.max(temperatureArray.length - 5, 0))
        }
      ]
    }}
    width={Dimensions.get("window").width} // from react-native
    height={220}
    yAxisLabel="$"
    yAxisSuffix="k"
    yAxisInterval={1} // optional, defaults to 1
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  /> 
  </View>

  <Text>Line Chart</Text>
        <View>
        <ProgressChart
        data={[message/100]}
        width={ Dimensions.get("window").width }
        height={220}
        radius={50}
        chartConfig={{
          //backgroundColor: '#478438',
          backgroundGradientFrom: '#FFF8E1',
          backgroundGradientTo: '#FFF8E1',
          //decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        }}
        style= {{
          borderRadius: 15,
        }}
        hideLegend={true}
      />
        {/* <ProgressChart
  data= {0.4}
  width={Dimensions.get("window").width}
  height={220}
  strokeWidth={16}
  radius={32}
  chartConfig={{
          //backgroundColor: '#478438',
          backgroundGradientFrom: '#FFF8E1',
          backgroundGradientTo: '#FFF8E1',
          //decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        }}
//   chartConfig={{
//   backgroundGradientFrom: "#1E2923",
//   backgroundGradientFromOpacity: 0,
//   backgroundGradientTo: "#08130D",
//   backgroundGradientToOpacity: 0.5,
//   color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
//   strokeWidth: 2, // optional, default 3
//   barRadius: 0.5
// }}
  hideLegend={false}
/> */}
        </View>


      <StatusBar style="auto" />
    </View>
  );
}

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