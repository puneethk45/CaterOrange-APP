import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignUpForm from './components/SignUpForm';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import Cart from './components/Cart';
import OrderList from './components/MyOrders';
import { CartProvider } from './CartContext';
import { navigationRef } from './components/RootNavigation';
import { EventFormScreen, WelcomeScreen } from './components/WelcomeScreen';
import FoodOrderApp from './components/menu'; 
import CartModel from './components/CartModel';
import OrderScreen from './components/EventMyOrders';
import AddressForm from './components/Address';
import Orders from './components/Orders';
import { ShowDateProvider } from './components/DateContext';

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const updateAuthState = async () => {
    const data = await AsyncStorage.getItem('isLoggedIn');
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!(data === 'true' && token));
  };
    
  useEffect(() => {
    // Function to check login status from AsyncStorage
    const checkLoginStatus = async () => {
      try {
        const data = await AsyncStorage.getItem('isLoggedIn');
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!(data === 'true' && token));
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);



  const handleLogout = async () => {
    try {
      const signupMethod = await AsyncStorage.getItem('signupMethod'); // Get the signup method
  
      if (signupMethod === 'manual') {
        await AsyncStorage.multiRemove(['isLoggedIn', 'token', 'userInformation', 'signupMethod']);
      } 
      else if (signupMethod === 'google') {
        await AsyncStorage.multiRemove(['isLoggedIn', 'token', 'userInfo', 'signupMethod']);
      }
      else if (signupMethod === 'signin') {
        await AsyncStorage.multiRemove(['isLoggedIn', 'token', 'userDP', 'signupMethod']);
      }
      else {
        await AsyncStorage.multiRemove(['isLoggedIn', 'token', 'userInfo', 'userInformation', 'signupMethod']);
      }
      
      setIsLoggedIn(false); // Update the state after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <CartProvider>
      <ShowDateProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
            <Stack.Screen
        name="HomeScreen"
       options={{
          headerShown: false // Explicitly hide header for HomeScreen
                       }}
                       >
                   {(props) => <HomeScreen {...props} onLogout={handleLogout} />}
                 </Stack.Screen>

                 <Stack.Screen 
        name="EventForm" 
        component={EventFormScreen}
        options={{ headerShown: false }} 
      />
              <Stack.Screen
                name="Cart"
                component={Cart}
                options={{
                  headerShown: true, // Show header for Cart screen
                  title: 'Proceed to Payment',
                }}
              />
               <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
              <Stack.Screen
                name="MyOrders"
                component={OrderScreen}
                options={{
                  headerShown: true, // Show header for Cart screen
                  title: 'My Orders',
                }}
              />
              <Stack.Screen
                name="CorporateOrders"
                component={OrderList}
               
              />
<Stack.Screen
  name="MOrders"
  component={Orders}
  options={{
    headerShown: true,
    title: 'My Orders',
  }}
  initialParams={{
    initialTab: 'Corporate', // Pass the desired initial tab here
  }}
/>

<Stack.Screen
  name="menu"
  options={{ headerShown: false }}
>
  {(props) => <FoodOrderApp {...props} onLogout={handleLogout} />}
</Stack.Screen>
        <Stack.Screen 
        name="Orders" 
        component={OrderScreen} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="Mycart" 
        component={CartModel} 
        options={{ headerShown: false }} 
      /> 
        <Stack.Screen 
        name="address" 
        component={AddressForm} 
        options={{ headerShown: false }} 
      /> 
            </>
          ) : (
            <>
             <Stack.Screen 
                name="Login" 
                options={{ headerShown: false }} 
              >
                {(props) => <LoginScreen {...props} onLoginSuccess={updateAuthState} />}
              </Stack.Screen>
              <Stack.Screen 
                name="SignUp" 
                options={{ headerShown: false }}
              >
                {(props) => <SignUpForm {...props} onLoginSuccess={updateAuthState} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </ShowDateProvider>
    </CartProvider>
  );
};

export default App;