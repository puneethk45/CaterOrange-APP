
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const API_BASE_URL = 'https://dev.caterorange.com/api';


// const API_BASE_URL = 'https://localhost:4000/api';




// console.log("token in storage",token);



const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:4000'  
  : 'http://localhost:4000'; 


export const myorders = async () => {
  try {

    const token = await AsyncStorage.getItem('token');
    console.log("token in async",token);
    
    const response = await axios.get(`${API_BASE_URL}/myorders`, {
      headers: {
        token: token,
      },
    });
    
     console.log("response in myorders",response);
    
    if (response.data) {
      return response.data;
    } else {
      console.log('No data received from the server.');
      return [];
    }
  } catch (error) {
    console.log('Failed to fetch orders:', error);
    Alert.alert(
      'Error',
      'Failed to fetch orders. Please try again later.',
      [{ text: 'OK' }]
    );
    return [];
  }
};


// Optional: Add a test connection function
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/myorders`);
    console.log('Connection test response:', response.data);
    return true;
  } catch (error) {
    console.log('Connection test error:', error);
    Alert.alert(
      'Connection Error',
      'Could not connect to the server. Please check if the backend is running.',
      [{ text: 'OK' }]
    );
    return false;
  }
};