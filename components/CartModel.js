
import React, { useRef, useEffect, useState } from 'react';
import {
 View,
 Text,
 Modal,
 TouchableOpacity,
 Animated,
 Dimensions,
 TextInput,
 StyleSheet,
 ScrollView,
 Image,
 Switch,
 Platform,Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import phonepeSDK from 'react-native-phonepe-pg';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AddressForm from './Address';
const API_BASE_URL = 'https://dev.caterorange.com/api';

const { width } = Dimensions.get('window');

const CartModel = ({ 
 cartModalVisible, 
 setCartModalVisible,
 toggleStates,
 setToggleStates,
 guests,
 date,time
}) => {
 console.log("plates",guests,"time",time,date);
 const slideAnim = useRef(new Animated.Value(width)).current;
 const [showAddressForm, setShowAddressForm] = useState(false);
 const [cartId,setCartId]=useState(null)
 const [totalbill,setTotalbill]=useState(null)
 const navigation = useNavigation()
 const [selectedAddress, setSelectedAddress] = useState({
 tag: '',
 pincode: '',
 line1: '',
 line2: '',
 ship_to_name: '',
 ship_to_phone_number: ''
 });
 const CONFIG = {
 environment: 'SANDBOX',
 merchantId: 'PGTESTPAYUAT86',
 appId: '1',
 enableLogging: true,
 saltKey: '96434309-7796-489d-8924-ab56988a6076',
 saltIndex: '1',
 callbackUrl: 'https://webhook.site/callback-url'
 };

 const handleClose = () => {
  // Call the provided setCartModalVisible function
  // This will now trigger the refetch because we modified the parent component
  setCartModalVisible(false);
};
 const generateTransactionId = () => {
 const timestamp = Date.now();
 const random = Math.floor(Math.random() * 1000000);
 return `MT${timestamp}${random}`;
 };
 const generateChecksum = (payload) => {
 try {
 // Step 1: Convert payload to Base64
 const payloadBase64 = Base64.encode(JSON.stringify(payload));
 
 // Step 2: Concatenate in correct order: base64 + /pg/v1/pay + saltKey
 // Note: No additional characters or spaces between concatenated strings
 const stringToHash = payloadBase64 + "/pg/v1/pay" + CONFIG.saltKey;
 
 // Step 3: Generate SHA256 hash
 const hash = sha256(stringToHash);
 
 // Step 4: Append salt index with ### separator
 const checksum = `${hash}###${CONFIG.saltIndex}`;
 
 console.log('Auth Debug:', {
 originalPayload: payload,
 payloadBase64,
 stringToHash,
 finalChecksum: checksum
 });
 
 return {
 payloadBase64,
 checksum
 };
 } catch (error) {
 console.error('Checksum Generation Error:', error);
 throw error;
 }
 };

 const handleAddressSelect = (address) => {
 setSelectedAddress(address);
 setShowAddressForm(false);
 };

 const handleAddressAdd = () => {
 // Refresh the selected address after adding a new one
 fetchAddress();
 setShowAddressForm(false);
 };

 const fetchAddress = async () => {
 try {
 const token = await AsyncStorage.getItem('token');
 const response = await axios.get(`${API_BASE_URL}/address/getalladdresses`, {
 headers: {token : token }
 });
 console.log('add',response.data.address)
 if (response.data.address && response.data.address.length > 0) {
 // Get the address in the last row (the last element of the array)
 const lastAddress = response.data.address[response.data.address.length - 1];
 setSelectedAddress(lastAddress);
 console.log(lastAddress);
 } else {
 // Show a message when no address is found
 console.log("Address not added");
 }
 } catch (error) {
 console.error('Error fetching selected address:', error);
 }
 };
 

 useEffect(() => {
    console.log('hi address')
 fetchAddress();
 }, []);

 const formatAddress = (address) => {
 if (!address) return '';
 return `${address.tag}, ${address.line1}, ${address.line2}, ${address.pincode}`;
 };
 const address={
 a:'dfghj',
 b:'sdfg'
}
 const [cartItems, setCartItems] = useState([]);
 useEffect(() => {
 if (cartModalVisible) {
 Animated.spring(slideAnim, {
 toValue: 0,
 useNativeDriver: true,
 friction: 8,
 }).start();
 } else {
 Animated.spring(slideAnim, {
 toValue: width,
 useNativeDriver: true,
 friction: 8,
 }).start();
 }
 fetchData();
 }, [cartModalVisible]);

 
 const fetchData = async () => {
 try {
 const token = await AsyncStorage.getItem('token');

 // Check if the token is available
 if (!token) {
 throw new Error('Token not found');
 }
console.log("hello cart")
 // Make the API request with the token in the headers
 const response = await axios.get(`${API_BASE_URL}/cart/getcart`, {
  headers: {
    token: token,
  }
}
);
 console.log("data",response.data)

 setCartId(response.data.cartitem.eventcart_id)
 setCartItems(response.data.cartitem.cartData || []);
 } catch (error) {
 console.error(error);
 }
 };

 useEffect(() => { 
 fetchData();
 
 }, []);




 const calculateItemPrice = (item) => {
 if (toggleStates[item.product_id]) {
    // cost = (item.price_per_wtorvol_units * 1000) * item.quantity * item.plates;
   costpergram = item.price_per_wtorvol_units / item.min_wtorvol_units_per_plate;
   
   costperkg = (costpergram * 1000)*item.quantity;
 return costperkg;
 } else {
  console.log(item.priceperunit,item.quantity,guests);
  const pcscost = item.priceperunit * item.quantity*guests;
  console.log("pcs",pcscost);
 return item.priceperunit * item.quantity*guests;
 }
 };

 const calculateSubtotal = () => {
 return cartItems.reduce((sum, item) => {
 return sum + calculateItemPrice(item);
 }, 0);
 };

 const calculateTotal = () => {
 const subtotal = calculateSubtotal();
//  setTotalbill(subtotal)
 console.log('sub',subtotal)
 return subtotal
 };

 const handleToggle = (itemId) => {
 setToggleStates(prev => ({
 ...prev,
 [itemId]: !prev[itemId]
 }));
 
 const updatedCartItems = cartItems.map(cartItem => {
 if (cartItem.product_id === itemId) {
 return {
 ...cartItem,
 selectedUnit: !toggleStates[itemId] ? cartItem.wtorvol_units : cartItem.plate_units,
 isToggled: !toggleStates[itemId]
 };
 }
 return cartItem;
 });
 
 setCartItems(updatedCartItems);
 addItemToBackend(updatedCartItems);
 };
 

 // const handleQuantityInput = (itemId, value) => {
 // const numValue = parseInt(value) || 0;
 
 // if (numValue >= 0) {
 // // Update the cart items locally
 // setCartItems(prevCartItems => 
 // prevCartItems.map(item => 
 // item.product_id === itemId 
 // ? { ...item, quantity: numValue } 
 // : item
 // )
 // );
 
 // // Call updateQuantity to handle any other related actions
 // updateQuantity(itemId, numValue - (cartItems.find(item => item.product_id === itemId)?.quantity || 0));
 // }
 // };
 const updateQuantity = async(itemId, delta) => {
 // Calculate updated cart items
 const updatedCartItems = cartItems.map(item =>
 item.product_id === itemId
 ? { ...item, quantity: Math.max(1, item.quantity + delta) } // Ensure quantity doesn't go below 1
 : item
 );
 
 
 // Update state with the updated cart items
 setCartItems(updatedCartItems);
 console.log(updatedCartItems)
 addItemToBackend(updatedCartItems)
 
 // Return if needed
 };
 
 const handleQuantityInput = async(itemId, value) => {
 const numValue = parseInt(value) || 0;
 
 if (numValue >= 0) {
 // Calculate updated cart items
 const updatedCartItems = cartItems.map(item =>
 item.product_id === itemId ? { ...item, quantity: numValue } : item
 );
 setCartItems(updatedCartItems);
 addItemToBackend(updatedCartItems)
 
 
 }
 };

 const removeCartItem = (itemId) => {
 // Remove item from the database (you can integrate your database delete logic here)
 
 // Update the state to remove the item from cartItems
 const updatedCartItems = cartItems.filter(item => item.product_id !== itemId);
 setCartItems(updatedCartItems)
 addItemToBackend(updatedCartItems)
 };


 
 
//  const addItemToBackend = async (cartItems) => {
//  try {
//  // Retrieve the token from AsyncStorage
//  console.log('hello')
//  const token = await AsyncStorage.getItem('token');
 
//  if (!token) {
//  console.log('Token not found in AsyncStorage');
//  return;
//  }
 
//  console.log('Retrieved token:', token);
 
//  // Make the request to the backend with the token in headers
//  await axios.post(
//  'http://192.168.123.52:4000/api/cart/add',
//  {
//  totalAmount: 100,
//  cartData: cartItems,
//  address,
//  selectedDate: '2-12-2024',
//  numberOfPlates: '100',
//  selectedTime: '3:20',
//  },
//  {
//  headers: {
//  token: token, // Add the token directly to headers
//  },
//  }
//  );
 
//  console.log('Item added to backend cart successfully');
//  } catch (error) {
//  console.error('Error adding item to backend cart:', error);
//  }
//  };
console.log('cartit',cartItems)

//totalAmount, cartData, address, selectedDate, numberOfPlates, selectedTime
const addItemToBackend = async (cartItems) => {
    try {
    // Retrieve the token from AsyncStorage
    console.log('hello',cartItems);
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
    console.log('Token not found in AsyncStorage');
    return;
    }
    
    console.log('Retrieved token:', token);
    const requestData = {
       totalAmount:calculateTotal().toFixed(2),
       cartData: cartItems,
       address,
       selectedDate: date,
       numberOfPlates: guests,
       selectedTime: time,
     };
   
   
     console.log('Sending request with data:', requestData);
   
       // Make the request to the backend with the token in headers
       const response = await axios.post(
         `${API_BASE_URL}/cart/add`,
         requestData,
         {
           headers: {
             token: token,
           },
           timeout: 5000, // 5 second timeout
         }
       );
   
       console.log('Backend response:', response.data);
       console.log('Item added to backend cart successfully');
       
    // Make the request to the backend with the token in headers
   //  await axios.post(
   //  'http://192.168.1.48:4000/api/cart/add',
   //  {
   //  totalAmount: 100,
   //  cartData: cartItems,
   //  address,
   //  selectedDate: date,
   //  numberOfPlates: guests,
   //  selectedTime: time,
   //  },
   //  {
   //  headers: {
   //  token: token, // Add the token directly to headers
   //  },
   //  }
   //  );
    // console.log(totalAmount)
   console.log("just");
    console.log('Item added to backend cart successfully');
    } catch (error) {
    console.error('Error adding item to backend cart:', error);
    }
   };


 if (!Array.isArray(cartItems)) {
 return (
 <Modal
 animationType="none"
 transparent={true}
 visible={cartModalVisible}
//  onRequestClose={() => setCartModalVisible(false)}
onRequestClose={handleClose} 
 >
 <View style={styles.modalContainer}>
 <Animated.View 
 style={[
 styles.modalContent,
 {
 transform: [{ translateX: slideAnim }]
 }
 ]}
 >
 <View style={styles.header}>
 <Text style={styles.headerText}>My Cart</Text>
 <TouchableOpacity 
//  onPress={() => setCartModalVisible(false)}
onPress={handleClose}
 style={styles.closeButton}
 >
 <Icon name="close" size={24} color="#333" />
 </TouchableOpacity>
 </View>
 <View style={styles.emptyCartContainer}>
 <Icon name="shopping-cart" size={64} color="#ccc" />
 <Text style={styles.emptyCartText}>Your cart is empty</Text>
 <Text style={styles.emptyCartSubtext}>Add items to get started</Text>
 </View>
 </Animated.View>
 </View>
 </Modal>
 );
 }
 
 // export const cartToOrder = async(cartId)=>{
 // try {
 // const eventcart_id=cartId
 // console.log("eventcart_id in action",eventcart_id)
 // const response = await axios.post('http://localhost:4000/api/transfer-cart-to-order', {
 // eventcart_id
 // }, {
 // headers: {
 // token: `${localStorage.getItem('token')}` ,
 // 'Content-Type': 'application/json' 
 // }
 // });
 // console.log("response from cart",response);
 // return response.data;
 // } catch (err) {
 // console.log(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
 // }
 // }
 const transferCartToOrder = async () => {
 try {
    const token = await AsyncStorage.getItem('token');
  console.log(token)
    console.log('hiii tran')


    const requestBody = {
        delivery_status: 'shipped',
        total_amount: calculateTotal().toFixed(2),
        PaymentId: null,
        delivery_details: null,
        event_order_details: JSON.stringify(cartItems),
        event_media: null,
        customer_address: address,
        payment_status: 'pending',
        event_order_status: 'success',
        number_of_plates: guests,
        processing_date: date,
        processing_time: time
      };
      console.log("rb",requestBody)
      // Make the POST request using axios
      const response = await axios.post(
        `${API_BASE_URL}/transfer-cart-to-order`,
        requestBody,
        {
          headers: {
            token: token  // Consider using Authorization header for standard practice
          }
        }
      );
 console.log("response from cart",response);
 return response.data;
 } catch (err) {
 console.log(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
 }
 };

 
 const recordPayment = async (paymentDetails) => {
  
 try {
  const token = await AsyncStorage.getItem('token');
 // Construct the payment details object based on your backend's expected payload
 const paymentPayload = {
 paymentType: paymentDetails.paymentType || 'PhonePe', // Default payment type
 merchantTransactionId: paymentDetails.merchantTransactionId,
 phonePeReferenceId: "PH0004",
 paymentFrom: paymentDetails.paymentFrom || 'Online', // Default payment source
 instrument: paymentDetails.instrument || 'Digital', // Default instrument
 bankReferenceNo: "BR0000",
 amount: paymentDetails.amount,
 customer_generated_id: paymentDetails.customerId, // Make sure to pass the customer ID
 eventorder_id: paymentDetails.eventOrderId // Pass the corporate order ID
 };
 console.log("pay",paymentPayload);
 // Make the axios POST request
 const response = await axios.post(`${API_BASE_URL}/insertevent-payment`, paymentPayload, {
 headers: {
 token:token
 // Add any additional headers like authorization if needed
 // 'Authorization': `Bearer ${token}`
 }
 });
 
 // Handle successful payment recording
 console.log('Payment recorded successfully:', response.data);
 
 // You might want to return the generated payment ID or do additional processing
 return response.data.payment_id;
 
 } catch (error) {
 // Handle any errors during payment recording
 console.error('Error recording payment:', error.response ? error.response.data : error.message);
 
 // Optionally show an alert or handle the error
 Alert.alert('Payment Recording Error', 'Could not record payment details');
 
 throw error; // Re-throw to allow caller to handle if needed
 }
 };

 const handlePayment = async () => {

 try {
  
 const order = await transferCartToOrder();
 console.log('order',order)
 

 const generated_id = order.eventorder_generated_id
const customer_id=order.customer_generated_id
//  const orderDetails=order.event_order_details
//  console.log(orderDetails)
 if (!generated_id) {
 throw new Error('Failed to create order');
 }
 // 1. Initialize SDK
 const initResponse = await phonepeSDK.init(
 CONFIG.environment,
 CONFIG.merchantId,
 CONFIG.appId,
 CONFIG.enableLogging
 );
 
 if (!initResponse) {
 throw new Error('SDK initialization failed');
 }
 
 // 2. Prepare request body according to PhonePe specifications
 const requestBody = {
 merchantId: CONFIG.merchantId,
 merchantTransactionId: generateTransactionId(),
 merchantUserId: `MUID${Date.now()}`,
 amount: (order.total_amount)*100, // Ensure amount is integer
 mobileNumber: 9490489044,
 callbackUrl: CONFIG.callbackUrl,
 paymentInstrument: {
 type: 'PAY_PAGE'
 }
 };
 
 // 3. Generate checksum and get base64 payload
 const { payloadBase64, checksum } = generateChecksum(requestBody);
 
 console.log('Transaction Request:', {
 requestBody,
 payloadBase64,
 checksum
 });
 
 // 4. Start transaction with correct parameters
 const transactionResponse = await phonepeSDK.startTransaction(
 payloadBase64,
 checksum,
 null,
 null
 );
 
 console.log('Transaction Response:', transactionResponse);
 
 if (transactionResponse.status === 'SUCCESS') {
 const paymentDetails = {
 paymentType: 'PhonePe',
 merchantTransactionId: requestBody.merchantTransactionId,
 phonePeReferenceId: transactionResponse.transactionId, // Adjust based on actual response
 paymentFrom: 'Online',
 instrument: 'Digital',
 bankReferenceNo: transactionResponse.bankReferenceNumber, // Adjust based on actual response
 amount: (order.total_amount), // Convert back to original amount
 customerId: customer_id, // Implement this function to get current user ID
 eventOrderId: generated_id
 };
 const generatedPaymentId = await recordPayment(paymentDetails);
 

 navigation.navigate('MOrders', { initialTab: 'Events' });
console.log("Payment Successful")
 
 
 
 
 } else {
 throw new Error(transactionResponse.error || 'Transaction failed');
 
 }
 
 } catch (error) {
 console.error('Payment Error:', error);
 let errorMessage = 'Transaction failed. ';
 
 // Parse PhonePe error message if available
 if (error.message && error.message.includes('key_error_result')) {
 try {
 const errorJson = JSON.parse(
 error.message.split('key_error_result:')[1]
 );
 errorMessage += `Error ${errorJson.code}: ${errorJson.message || 'Please verify credentials'}`;
 } catch (e) {
 errorMessage += error.message;
 }
 } else {
 errorMessage += error.message;
 }
 
 Alert.alert('Error', errorMessage);
 } 
 };

 return (
 <Modal
 animationType="none"
 transparent={true}
 visible={cartModalVisible}
 onRequestClose={() => setCartModalVisible(false)}
 >
 <View style={styles.modalContainer}>
 <Animated.View 
 style={[
 styles.modalContent,
 {
 transform: [{ translateX: slideAnim }]
 }
 ]}
 >
 <View style={styles.header}>
 <Text style={styles.headerText}>My Cart ({cartItems.length})</Text>
 <TouchableOpacity 
 onPress={() => setCartModalVisible(false)}
 style={styles.closeButton}
 >
 <Icon name="close" size={24} color="#333" />
 </TouchableOpacity>
 </View>
 <View style={styles.addressContainer}>
 <View>
 <Text style={styles.addressLabel}>Delivery Address:</Text>
 <Text style={styles.addressText}>
 {selectedAddress ? formatAddress(selectedAddress) : 'No address selected'}
 </Text>
 {selectedAddress && (
 <Text style={styles.addressContact}>
 {selectedAddress.ship_to_name} • {selectedAddress.ship_to_phone_number}
 </Text>
 )}
 </View>
 <View>
 <TouchableOpacity 
 style={styles.changeAddressButton}
 onPress={() => setShowAddressForm(true)}
 >
 <Text style={styles.changeAddressButtonText}>Change Address</Text>
 </TouchableOpacity>
 </View>
 </View>
 <ScrollView style={styles.itemsContainer}>
 {cartItems.map((item) => (
 <View key={item.product_id} style={styles.itemCard}>
 
 {/* Dustbin Icon in Top Right Corner */}
 <TouchableOpacity 
 onPress={() => removeCartItem(item.product_id)} 
 style={styles.dustbinIcon}
 >
 <Icon name="delete" size={24} color="#FF0000" />
 </TouchableOpacity>
 
 <Image 
 source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8' }} 
 style={styles.itemImage} 
 />

 
 
 <View style={styles.itemDetails}>
 <Text style={styles.itemName}>{item.productname}</Text>
 
 {/* <Text style={styles.itemPrice}>

 ₹{toggleStates[item.product_id] ? item.price_per_wtorvol_units : item.priceperunit} per {toggleStates[item.product_id] ? item.wtorvol_units : item.plate_units}
 </Text> */}




<Text style={styles.itemPrice}>
  
  {toggleStates[item.product_id]
    ? `${(item.price_per_wtorvol_units / item.min_wtorvol_units_per_plate) * 1000} * ${item.quantity} = ₹${((item.price_per_wtorvol_units / item.min_wtorvol_units_per_plate) * 1000 * item.quantity).toFixed(2)}`
    : `${item.priceperunit} * ${item.quantity} * ${guests} = ₹${(item.priceperunit * item.quantity * guests).toFixed(2)}`
  }
</Text>

<View style={{ flex: 1 }}>
  {/* Row containing the toggle switch and quantity controls */}
  
  <View style={styles.rowContainer}>
    {/* Quantity Section */}
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        onPress={() => updateQuantity(item.product_id, -1)}
        style={styles.quantityButton}
      >
        <Text style={styles.quantityButtonText}>-</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.quantityInput}
        value={item.quantity.toString()}
        onChangeText={(value) => handleQuantityInput(item.product_id, value)}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        onPress={() => updateQuantity(item.product_id, 1)}
        style={styles.quantityButton}
      >
        <Text style={styles.quantityButtonText}>+</Text>
      </TouchableOpacity>
    </View>
   
    {item.isdual && (
      <View style={styles.switchContainer}>
        <Switch
          value={toggleStates[item.product_id] || false}
          onValueChange={() => handleToggle(item.product_id)}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={toggleStates[item.product_id] ? "#f5dd4b" : "#f4f3f4"}
        />
        {/* Display units below the toggle bar */}
        <Text style={styles.unitText}>
          {toggleStates[item.product_id] ? item.wtorvol_units : item.plate_units}
        </Text>
        
      </View>
    )}
   

    
  </View>

  {/* Display total */}
  <View style={styles.itemTotal}>
    <Text style={styles.itemTotalText}>
      Total: ₹{calculateItemPrice(item).toFixed(2)}
    </Text>
  </View>
</View>
 
 </View>

 
 </View>
 
 ))}
 </ScrollView>

 {/* Cart Summary */}
 <View style={styles.summaryContainer}>
 
 
 <View style={[styles.summaryRow, styles.totalRow]}>
 <Text style={styles.totalLabel}>Total</Text>
 <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
 </View>
 </View>

 <TouchableOpacity style={styles.proceedButton}    onPress={handlePayment}
 >
 <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
 </TouchableOpacity>
 </Animated.View>
 <Modal
 animationType="slide"
 transparent={true}
 visible={showAddressForm}
 onRequestClose={() => setShowAddressForm(false)}
 >
 <AddressForm
 onAddressSelect={handleAddressSelect}
 onAddressAdd={handleAddressAdd}
 onClose={() => setShowAddressForm(false)}
 />
 </Modal>
 </View>
 </Modal>
 );
};

const styles = StyleSheet.create({
 modalContainer: {
 flex: 1,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 },
 modalContent: {
 position: 'absolute',
 right: 0,
 top: 0,
 bottom: 0,
 width: '90%',
 backgroundColor: 'white',
 paddingTop: Platform.OS === 'ios' ? 40 : 0,
 ...Platform.select({
 ios: {
 shadowColor: '#000',
 shadowOffset: { width: -2, height: 0 },
 shadowOpacity: 0.25,
 shadowRadius: 5,
 },
 android: {
 elevation: 5,
 },
 }),
 },
 header: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 padding: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 headerText: {
 fontSize: 20,
 fontWeight: 'bold',
 },
 closeButton: {
 padding: 8,
 },
 itemsContainer: {
 flex: 1,
 },
 itemCard: {
 flexDirection: 'row',
 padding: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 borderRadius:8
 },
 itemImage: {
 width: 80,
 height: 80,
 borderRadius: 8,
 marginRight: 12,
 },
 dustbinIcon: {
 position: 'absolute',
 top: 15,
 right: 25,
 zIndex: 1, // Ensure it appears on top of other elements
 },
 itemDetails: {
 flex: 1,
 },
 itemName: {
 fontSize: 16,
 fontWeight: '600',
 marginBottom: 4,
 color:'green',
 },
 itemPrice: {
 fontSize: 14,
 color: '#666',
 marginBottom: 8,
 },
 toggleContainer: {
  flexDirection: 'column',
  alignItems: 'flex-end',
  marginVertical: 10,
},
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  switchContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 10,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#333",
  },
//  toggleContainer: {
//  flexDirection: 'row',
//  alignItems: 'center',
//  justifyContent: 'space-between',
//  marginBottom: 8,
//  },
//  unitText: {
//  fontSize: 14,
//  color: '#666',
//  },
 quantityContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: 'lightgray',
 borderRadius: 6, // Reduced radius for a smaller look
//  paddingVertical: 1, // Adjusted padding for a more compact design
 paddingHorizontal: 3,
 height:40,
 alignSelf: 'flex-start',
 marginBottom: 6, // Slightly reduced bottom margin
 },
 quantityButton: {
 width: 26, // Reduced width for smaller button size
 height: 26, // Reduced height for smaller button size
 backgroundColor: 'white',
 borderRadius: 13, // Adjusted radius to match the smaller button
 justifyContent: 'center',
 alignItems: 'center',
 ...Platform.select({
 ios: {
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.2,
 shadowRadius: 1,
 },
 android: {
 elevation: 1, // Reduced elevation for a sleeker look
 },
 }),
 },
 quantityButtonText: {
 fontSize: 18, // Slightly smaller text size
 color: 'black',
 },
 quantityInput: {
 width: 35, // Reduced width for smaller input box
 textAlign: 'center',
 fontSize: 14, // Reduced font size for a more compact look
 color: '#333',
 },

 itemTotal: {
 marginTop: 4,
 },
 itemTotalText: {
 fontSize: 14,
 fontWeight: '600',
 color: '#333',
 },
 summaryContainer: {
 padding: 16,
 borderTopWidth: 1,
 borderTopColor: '#eee',
 },
 summaryRow: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 8,
 },
 summaryLabel: {
 fontSize: 14,
 color: '#666',
 },
 summaryValue: {
 fontSize: 14,
 color: '#333',
 },
 totalRow: {
 marginTop: 8,
 paddingTop: 8,
 borderTopWidth: 1,
 borderTopColor: '#eee',
 },
 totalLabel: {
 fontSize: 20,
 fontWeight: 'bold',
 },
 totalValue: {
 fontSize: 16,
 fontWeight: 'bold',
 color: '#FF4757',
 },
 proceedButton: {
 backgroundColor: '#FF4757',
 margin: 16,
 padding: 16,
 borderRadius: 8,
 alignItems: 'center',
 },
 proceedButtonText: {
 color: 'white',
 fontSize: 16,
 fontWeight: 'bold',
 },
 emptyCartContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20,
 },
 emptyCartText: {
 fontSize: 20,
 fontWeight: 'bold',
 color: '#333',
 marginTop: 16,
 },
 emptyCartSubtext: {
 fontSize: 14,
 color: '#666',
 marginTop: 8,
 },

 addressContainer: {
 paddingHorizontal: 16,
 paddingVertical: 10,
 backgroundColor: '#f7f7f7',
 borderBottomWidth: 1,
 borderBottomColor: '#ddd',
 },
 addressLabel: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 },
 addressText: {
 fontSize: 14,
 color: "black",
 marginTop: 4,
 },
 addressContact: {
 fontSize: 14,
 color: '#666',
 marginTop: 4,
 },
 changeAddressButton: {
 backgroundColor: '#800080',
 paddingVertical: 8,
 paddingHorizontal: 16,
 borderRadius: 8,
 alignItems: 'center',
 marginTop: 8,
 },
 changeAddressButtonText:{
 color:"white"
 }
});

export default CartModel;
