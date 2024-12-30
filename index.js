
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';



import App from './App';
import HomeScreen from './components/HomeScreen';
import Pay from './components/Pay';
import OrderList from './components/MyOrders';
AppRegistry.registerComponent(appName, () => App);
