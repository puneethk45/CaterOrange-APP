import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import FlatCards from './components/FlatCards'
import ElevatedCards from './components/ElevatedCards'
import FancyCards from './components/FancyCards'
import ActionCards from './components/ActionCards'
import ContactList from './components/ContactList'
import PasswordGenerator from './components/PasswordGenerator'
import BGchanger from './components/BGchanger'
import RollDice from './components/RollDice'
import CurrencyConvertor from './components/CurrencyConvertor'
import TicTacToe from './components/TicTacToe'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from './components/Home'
import Details from './components/Details'

export type RootStackParamList ={
    Home : undefined;
    Details : {product :Product}
}

const Stack =createNativeStackNavigator<RootStackParamList>() 
const AppPro = () => {
  return (
  
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
            <Stack.Screen 
            name="Home"
            component={Home} 
            options={{
                title:"Trending Products"
            }}/>
             <Stack.Screen 
            name="Details"
            component={Details} 
            options={{
                title:"Product Details"
            }}/>
        </Stack.Navigator>

    </NavigationContainer>
      

      
      
  
   
  )
}

export default AppPro