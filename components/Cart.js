import React, { useState,useEffect } from 'react';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,Button,Alert,ActivityIndicator,ChevronDown
} from 'react-native';
import { MapPin, Plus } from 'lucide-react-native';
import phonepeSDK from 'react-native-phonepe-pg';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../CartContext';
import paymentSuccessAnimation from '../assets/paymentSuccess.json';
import paymentFailureAnimation from '../assets/paymentFailure.json';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AddressForm from './AddressComponent';
const API_BASE_URL = 'https://dev.caterorange.com/api';

const DateGroupedCartItem = ({ date, items, onUpdateQuantity, onRemove }) => {
  const formattedDate = new Date(date).toLocaleDateString();
  
  return (
    <View style={styles.dateCard}>
      <Text style={styles.dateHeader}>{formattedDate}</Text>
      {items.map((item, index) => (
        <View key={`${item.id}-${index}`} style={styles.cartItem}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemContent}>
            <View style={styles.itemInfo}>
              <Text style={styles.foodType}>{item.foodType}</Text>
              <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.itemFooter}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onUpdateQuantity(item.id, date, -1)}
                  disabled={item.quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.dateQuantities[date]}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => onUpdateQuantity(item.id, date, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                onPress={() => onRemove(item.id, date)} 
                style={styles.removeButton}
              >
                <Icon name="trash-outline" size={20} color="#FF6347" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      <View style={styles.dateTotalContainer}>
        <Text style={styles.dateTotalLabel}>Date Total:</Text>
        <Text style={styles.dateTotalAmount}>
          ₹{items.reduce((total, item) => total + (item.price * item.dateQuantities[date]), 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};



const Cart = () => {
  
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationSource, setAnimationSource] = useState(null);
  const [cartItems, setCartItems] = useState([]); // State for cart items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation()
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [userId,setuserId] = useState('')
   const CONFIG = {
    environment: 'SANDBOX',
    merchantId: 'PGTESTPAYUAT86',
    appId: '1',
    enableLogging: true,
    saltKey: '96434309-7796-489d-8924-ab56988a6076',
    saltIndex: '1',
    callbackUrl: 'https://webhook.site/callback-url'
  };
  

  const handleAddressSelect = (address) => {
    console.log(address)
    setSelectedAddress(address);
    setShowAddressForm(false);
  };

  const AddressSection = () => (
   
      <View style={styles.addresscontainer}>
        <View style={styles.headerContainer}>
          <MapPin size={20} color="#4A4A4A" />
          <Text style={styles.heading}>Delivery Address</Text>
        </View>
        
        {selectedAddress ? (
          <TouchableOpacity 
            style={styles.addressCard}
            onPress={() => setShowAddressForm(true)}
            activeOpacity={0.7}
          >
            <View style={styles.tagContainer}>
              <View style={styles.tagPill}>
                <Text style={styles.tag}>{selectedAddress.tag}</Text>
              </View>
            </View>
            <Text style={styles.address}>
              {selectedAddress.line1},
            </Text>
            <Text style={styles.address}>
              {selectedAddress.line2}
            </Text>
            <Text style={styles.editText}>Tap to change</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddressForm(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Delivery Address</Text>
          </TouchableOpacity>
        )}
      </View>
    
  );
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `MT${timestamp}${random}`;
  };
  const sendOrderDetails = async (orderDetails,order_generated_id) => {
    try {
      let response;
      let details = orderDetails;
      const token = await AsyncStorage.getItem('token');
      console.log(details)
      // Loop through each order detail and send to API
      for (let i = 0; i < details.length; i++) {
        response = await axios.post(`${API_BASE_URL}/customer/corporateOrderDetails`, {
          corporateorder_id:order_generated_id,
          processing_date: details[i].date,
          delivery_status: 'Ordered',
          category_id: details[i].category_id,
          quantity: details[i].quantity,
          active_quantity: details[i].quantity,
          media: null,
          delivery_details:null
        },{
          headers: {
            token: token,
          },
        });
        
        console.log('Order details sent in loop');
      }
      
      console.log('Order details sent:', orderDetails);
      
      if (response) {
        console.log('Order details successfully added:', response.data);
      } else {
        console.error('Failed to add details to order_table:', response.data);
      }
    } catch (error) {
      console.error('Error sending order details:', error);
    }
  };

 
  const transformCartItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    
    return items.map(item => ({
      ...item,
      // If dateQuantities already exists, use it; otherwise create new one from dates
      dateQuantities: item.dateQuantities || 
        (item.dates ? item.dates.reduce((acc, date) => {
          acc[date] = item.quantity || 1;
          return acc;
        }, {}) : {})
    }));
  };
  
  // Group items by date while maintaining individual quantities
  const groupItemsByDate = (items) => {
    if (!Array.isArray(items) || items.length === 0) return {};
  
    const grouped = {};
    items.forEach(item => {
      if (item.dateQuantities) {
        Object.entries(item.dateQuantities).forEach(([date, quantity]) => {
          if (!grouped[date]) {
            grouped[date] = [];
          }
          // Create a new item object for each date
          grouped[date].push({
            ...item,
            dateQuantities: { [date]: quantity },
            quantity: quantity
          });
        });
      }
    });
    console.log("grouped",grouped)
    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .reduce((obj, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});
  };
  const getToken = async() => {
    const requestBody ={
      access_token: AsyncStorage.getItem('token')
    }
    const response = await axios.get(`${API_BASE_URL}/customer`,requestBody)
    console.log(response.customer_generated_id)
  setuserId(response.customer_generated_id)

   
  }

  useEffect(() => {
      fetchCartItems();
    
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const access_token = await AsyncStorage.getItem('token')
    
      const response = await axios.get(`${API_BASE_URL}/cart`,{
        headers: {
           token: access_token // Use the retrieved token here
        }
     });
      
      // Add error checking for response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      const items = Object.entries(response.data).map(([id, itemString]) => {
        try {
          return {
            id,
            ...JSON.parse(itemString)
          };
        } catch (e) {
          console.error('Error parsing item:', e);
          return null;
        }
      }).filter(Boolean); // Remove any null items from parsing errors
      console.log("items in cart",items)
      const transformedItems = transformCartItems(items);
      console.log("items in teansform",transformedItems)
      setCartItems(transformedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to fetch cart items');
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, date, change) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const newQuantity = item.dateQuantities[date] + change;
      if (newQuantity < 1) return;

      // Create a copy of the item with updated date-specific quantity
      const updatedItem = {
        ...item,
        dateQuantities: {
          ...item.dateQuantities,
          [date]: newQuantity
        }
      };

      // Calculate the total price for all dates
      const total = Object.entries(updatedItem.dateQuantities)
        .reduce((sum, [date, qty]) => sum + (updatedItem.price * qty), 0);

      // Update the item in Redis with the new structure
      const redisItem = {
        ...updatedItem,
        dates: Object.keys(updatedItem.dateQuantities),
        quantity: newQuantity, // Keep this for backwards compatibility
        total: total
      };
      const access_token = await AsyncStorage.getItem('token')
      await axios.post(`${API_BASE_URL}/cart/update`, {
        itemId,
        item: redisItem
      },{
            headers: {
               token: access_token // Use the retrieved token here
            }
         });

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId, date) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      // Create a copy of date quantities without the removed date
      const { [date]: removedDate, ...remainingDateQuantities } = item.dateQuantities;
      const access_token = await AsyncStorage.getItem('token')
      if (Object.keys(remainingDateQuantities).length === 0) {
        // If no dates remain, remove the entire item
        await axios.delete(`${API_BASE_URL}/cart/${itemId}`,{
          headers: {
             token: access_token // Use the retrieved token here
          }
       });
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        // Update the item with remaining dates
        const updatedItem = {
          ...item,
          dateQuantities: remainingDateQuantities,
          dates: Object.keys(remainingDateQuantities)
        };

        // Calculate new total for Redis
        const total = Object.values(remainingDateQuantities)
          .reduce((sum, qty) => sum + (item.price * qty), 0);

        const redisItem = {
          ...updatedItem,
          total: total,
          quantity: Object.values(remainingDateQuantities)[0] // Use first date's quantity for compatibility
        };

        await axios.post(`${API_BASE_URL}/cart/update`, {
          
          itemId,
          item: redisItem
        },{
          headers: {
             token: access_token // Use the retrieved token here
          }
       });

        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? updatedItem : item
          )
        );
      }
    } catch (err) {
      console.error('Error removing item:', err);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + Object.entries(item.dateQuantities)
        .reduce((sum, [date, qty]) => sum + (item.price * qty), 0);
    }, 0);
  };


  // Corrected checksum generation according to PhonePe specifications
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





  const transferCartToOrder = async () => {
    try {
      const transformedData = cartItems.flatMap(item =>
        item.dates.map(date => ({
            foodType: item.foodType,
            price: item.price,
            date: date,
            image: item.image,
            quantity: item.dateQuantities[date],
            category_id: item.category_id
        }))
    );
    const access_token = await AsyncStorage.getItem('token');

   
    const result = await axios.get(`${API_BASE_URL}/customer`, {
      headers: {
          token: access_token, // Send token in the Authorization header
      },
  });
  console.log("hi",result.data)
    
  
    const customer_generated_id= result.data.customer_generated_id
      const orderPayload = {
        customer_generated_id:customer_generated_id , // Replace with actual customer ID from your auth
        order_details: transformedData,
        total_amount: getTotalPrice(),
        paymentid: null, // Initially null as specified
        customer_address: selectedAddress, // Replace with actual address
        payment_status: 'pending' // Initially pending as specified
      };
       console.log("order",orderPayload)
      const response = await axios.post(
        `${API_BASE_URL}/customer/corporate/transfer-cart-to-order`,
        orderPayload,
        {
          headers: {
            token: access_token,
          },
        }
      );
   console.log("response is ",response)
      if (response.status === 200) {
        return response.data.order;
      } else {
        throw new Error('Failed to transfer cart to order');
      }
    } catch (error) {
      console.error('Error transferring cart to order:', error);
      throw error;
    }
  };

  const recordPayment = async (paymentDetails) => {
    try {
      // Construct the payment details object based on your backend's expected payload
      const paymentPayload = {
        paymentType: paymentDetails.paymentType || 'PhonePe', // Default payment type
        merchantTransactionId: paymentDetails.merchantTransactionId,
        phonePeReferenceId: paymentDetails.phonePeReferenceId,
        paymentFrom: paymentDetails.paymentFrom || 'Online', // Default payment source
        instrument: paymentDetails.instrument || 'Digital', // Default instrument
        bankReferenceNo: paymentDetails.bankReferenceNo,
        amount: paymentDetails.amount,
        customer_id: paymentDetails.customerId, // Make sure to pass the customer ID
        corporateorder_id: paymentDetails.corporateOrderId // Pass the corporate order ID
      };
      const token = await AsyncStorage.getItem('token');
      // Make the axios POST request
      const response = await axios.post(`${API_BASE_URL}/insert-payment`, paymentPayload, {
        headers: {
          'Content-Type': 'application/json',
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
      if (!selectedAddress) {
        Alert.alert(
          'Address Required',
          'You cannot proceed with payment without adding a delivery address.',
          [{ text: 'OK' }]
        );
        return;
      }

      const order = await transferCartToOrder();

      const order_generated_id=order.corporateorder_id
      const generated_id = order.corporateorder_generated_id
      const orderDetails=order.order_details
      const customer_id = order.customer_id
      console.log(orderDetails)
      if (!order_generated_id) {
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
        amount: Math.round(Number(getTotalPrice()) * 100), // Ensure amount is integer
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
          amount: requestBody.amount / 100, // Convert back to original amount
          customerId: customer_id, // Implement this function to get current user ID
          corporateOrderId: generated_id
        };
        const generatedPaymentId = await recordPayment(paymentDetails);
        if(generatedPaymentId)
          {
            
              await sendOrderDetails(orderDetails,order_generated_id);
              setAnimationSource(paymentSuccessAnimation);
            
          } 
       
        
          navigation.navigate('MOrders', { initialTab: 'Corporate' });


        
      } else {
        throw new Error(transactionResponse.error || 'Transaction failed');
        setAnimationSource(paymentFailureAnimation);

      }
      setShowAnimation(true);

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
      setAnimationSource(paymentFailureAnimation);
      setShowAnimation(true);
    } 
  };



  return (
    <SafeAreaView style={styles.container}>
      {showAnimation ? (
        <>
          <LottieView
            source={animationSource}
            autoPlay
            loop={false}
            onAnimationFinish={() => setShowAnimation(false)}
            style={styles.animation}
          />
          <Text style={styles.orderStatus}>
            {animationSource === paymentSuccessAnimation ? 'Order Successful' : 'Order Failed'}
          </Text>
        </>
      ) : (
        <>
          {showAddressForm ? (
            <AddressForm
              onAddressSelect={handleAddressSelect}
              onClose={() => setShowAddressForm(false)}
              onAddressAdd={() => setShowAddressForm(false)}
            />
          ) : (
            <>
              <ScrollView style={styles.scrollView}>
                <Text style={styles.header}>Your Cart</Text>
                <AddressSection />
  
                {loading ? (
                  <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
                ) : cartItems.length === 0 ? (
                  <Text style={styles.emptyCart}>Your cart is empty</Text>
                ) : (
                  Object.entries(groupItemsByDate(cartItems)).map(([date, items]) => (
                    <DateGroupedCartItem
                      key={date}
                      date={date}
                      items={items}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))
                )}
              </ScrollView>
  
              <View style={styles.footer}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</Text>
                </View>
  
                <TouchableOpacity
                  style={[
                    styles.payButton,
                    (!cartItems.length || loading) && styles.payButtonDisabled,
                  ]}
                  onPress={handlePayment}
                  disabled={!cartItems.length || loading}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  animation:{
    flex:1
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  cartItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  foodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    maxWidth: '70%',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
    color: '#007AFF',
  },
  removeButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  }, datesContainer: {
    marginVertical: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dates: {
    fontSize: 12,
    color: '#888',
  },
  dateCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  loader: {
    marginTop: 40,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  orderStatus: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  }, dateCard: {
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  dateTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dateTotalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  addresscontainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginLeft: 8,
  },
  addressCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagContainer: {
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A73E8',
  },
  address: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 2,
  },
  editText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default Cart;
