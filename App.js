import { StyleSheet, Text, View, TouchableOpacity, Button,  FlatList,  Dimensions, ScrollView } from 'react-native'; // import Button component
import { useState, useEffect } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import { Picker } from '@react-native-picker/picker';
import Collapsible from 'react-native-collapsible';

import Biophlx2logo from './src/Biophlx2logo.jpeg'
import { Image } from 'react-native';



const exercises = [
  'barbell squat',
  'barbell benchpress',
  'deadlift',
  'push-up',
  'Overhead barbell press'
];





export const manager = new BleManager();

const serviceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const characteristicUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

let tempTemperatureArray = [0,0,0,0,0]
let temperatureArray = [0,0,0,0,0]

let Array3 = [] //Velocity Array
let JointAArray = [] //Joint Range of Motion Array
let repArray = []  //Reps Array

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";







export default function App() {
  const [message, setMessage] = useState(4); //Time Under Tension
  const [message2, setMessage2] = useState(0); //Rep Acceleration
  const [message4, setMessage4] = useState(0); //Avg. Acceleration
  const [message5, setMessage5] = useState(0);  //Reps Completed
  const [message3, setMessage3] = useState(0);  //Joint Range of Motion
  const [StartStop, InitiateMessage] = useState(0);  // Start and Stop Recording Workout

  const numberRange = [...Array(101).keys()].slice(1);
const weightRange = [...Array(101).keys()].slice(1).map(n => n * 5);


  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [selectedReps, setSelectedReps] = useState(0);
  const [collapsed, setCollapsed] = useState(true);

  

  //State variables for if device is connected
    const [isConnected, setIsConnected] = useState(false);

    //What device is connected?
    const [connectedDevice, setConnectedDevice] = useState();


  

  function decrementCount() {
    setMessage(prevCount => prevCount - 1);
  }

  function incrementCount() {
    setMessage(prevCount => prevCount + 1);
  }

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
              
              const json = JSON.parse(base64.decode(characteristic.value));
               setMessage(json.value1);
              setMessage2(json.value2);
              setMessage5(json.value5);
              setMessage3(json.value3);
              setMessage4(json.value4);
              
             
              
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
                const json = JSON.parse(base64.decode(characteristic.value));
                setMessage(json.value1);
              setMessage2(json.value2);
              setMessage5(json.value5);
              setMessage3(json.value3);
              setMessage4(json.value4);
                
                
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

    useEffect(() => {
       Array3.push(message2);  //Velocity Array
       JointAArray.push(message3) //Joint Array 
       repArray.push(message5);
       console.log({Array3});
       console.log({JointAArray});
       console.log({repArray});
       
      
    }, [message5])

    

    const clearArray = () => {
  Array3 = [];
  repArray = [];
  JointAArray = [];
};

const [isRunning, setIsRunning] = useState(false);

  const toggleRunning = () => {
    setIsRunning(!isRunning);
    console.log({isRunning})
  };

 return (
   <View style={{ ...styles.container, marginTop: 50 }}>
   <Image
      source={Biophlx2logo}
      style={{ width: 700, height: 100, resizeMode: 'contain' }}
    />
   
    <ScrollView>
    <TouchableOpacity style={styles.connectButton}>
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
          title="Disconnect"
          onPress={() => {
            disconnectDevice();
          }}
          disabled={false}
        />
      )}
    </TouchableOpacity>
    <View style={[styles.container3, { marginTop: 100 }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Exercise Input</Text>
        <Text style={styles.headerButton} onPress={() => setCollapsed(!collapsed)}>
          {collapsed ? '+' : '-'}
        </Text>
      </View>
      
      <Collapsible collapsed={collapsed}>
        <View>
          <Text style={styles.label2}>Exercise:</Text>
          <Picker
            selectedValue={selectedExercise}
            onValueChange={(itemValue, itemIndex) => setSelectedExercise(itemValue)}
          >
            {exercises.map(exercise => (
              <Picker.Item key={exercise} label={exercise} value={exercise} />
            ))}
          </Picker>
          <View style={[styles.box2, { height: Dimensions.get('window').height * 0.15 }]}>
            <View style={styles.pickerWrapper}>
              <Text style={styles.label2}>Reps:</Text>
              <Picker
                style={styles.picker}
                selectedValue={selectedWeight}
                onValueChange={(itemValue, itemIndex) => setSelectedWeight(itemValue)}
              >
                {numberRange.map(num => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Text style={styles.label2}>Weight Lifted (lbs):</Text>
              <Picker
                style={styles.picker}
                selectedValue={selectedReps}
                onValueChange={(itemValue, itemIndex) => setSelectedReps(itemValue)}
              >
                {weightRange.map(num => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </Collapsible>

      
    </View>

    <Button
        title={isRunning ? 'Stop' : 'Start'}
        onPress={toggleRunning}
      />
  <View style={styles.container}>
    
<View style={styles.box}>
  <Text>Rep Velocity</Text>
  <View style={styles.barChartBox}>
    <BarChart
      data={{
        labels: [...Array(repArray)].map((_, i) => `Rep ${i+1}`),
        datasets: [
          {
            data: Array3.slice(0, message5)
          }
        ]
      }}
      width={Dimensions.get("window").width - 30}
      height={200}
      yAxisSuffix="m/s"
      yAxisInterval={1}
      chartConfig={{
        backgroundColor: '#8b0000',
backgroundGradientFrom: '#a30000',
backgroundGradientTo: '#b30000',

        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16
        },
        barPercentage: 0.75
      }}
    />
    <Text style={{alignSelf: 'center'}}>Rep #{message5}</Text>
  </View>

  <View style={styles.box}>
  <Text style={styles.text}>Acceleration for this rep is: {message2}m/s</Text>
</View>

<View style={styles.box}>
  <Text style={styles.text}>Average Acceleration for this Set is: {message4}m/s</Text>
</View>

</View>

{/* //Joint Range of Motion Graph// */}

<View style={styles.box}>
  <Text style={styles.text}>Joint Range of Motion</Text>
  <View style={styles.barChartBox}>
    <BarChart
      data={{
        labels: [...Array(repArray)].map((_, i) => `Rep ${i + 1}`),
        datasets: [
          {
            data: JointAArray.slice(0, message5),
          },
        ],
      }}
      width={Dimensions.get('window').width - 30}
      height={200}
      yAxisSuffix="°"
      yAxisInterval={1}
      chartConfig={{
        backgroundColor: '#0077be',
        backgroundGradientFrom: '#0096d6',
        backgroundGradientTo: '#00b5ff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        barPercentage: 0.5,
      }}
    />
    <Text style={{ ...styles.text, alignSelf: 'center' }}>Rep #{message5}</Text>
  </View>
</View>
<View style={styles.box}>
  <Text style={styles.text}>Joint Range for this rep is: {message3} Degrees</Text>
</View>

<View style={styles.box}>
  <Text style={styles.text}>Acceleration for this rep is: {JSON.stringify(message3)}</Text>
</View>

<Button title="Clear Array" onPress={clearArray} />
  </View>
</ScrollView>
</View>
  );
}



const styles = {
  scrollViewContent: {
    flexGrow: 1
  },
  connectButton: {
    position: 'absolute',
    top: 5,
    right: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,

  },
  connectButtonText: {
    color: '#fff'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    margin: 10,
    borderRadius: 10
  },
  buttonText: {
    fontSize: 30
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    marginTop: 20
  },
  barChartBox: {
    borderRadius: 10,
    overflow: 'hidden'
  },
  container3: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    margin: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    fontSize: 24, // increase font size
    fontWeight: 'bold',
    color: 'blue',
    paddingHorizontal: 10, // add padding
  },
  label2: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 0,
    alignSelf: 'center'
  },
  box2: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 100,
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
  },
  text: {
  fontSize: 18,
  color: '#888',
},
};