import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'https://dev.caterorange.com/api';


const OrderCard = ({ order }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRandomStatus = () => {
    const statuses = ['ordered', 'out-for-delivery', 'delivered'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const status = 'ordered';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.foodType}>{order.foodType}</Text>
          <Text style={styles.date}>{formatDate(order.date)}</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>₹{order.price}</Text>
          <Text style={styles.quantity}>Qty: {order.quantity}</Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusContainer}>
        <View style={styles.statusSection}>
          <View
            style={[
              styles.iconContainer,
              status === 'ordered' ? styles.activeIcon : styles.inactiveIcon,
            ]}
          >
            <Icon name="shopping-bag" size={20} color="white" />
          </View>
          <Text style={styles.statusText}>Ordered</Text>
        </View>
        
        <View style={styles.statusSection}>
          <View
            style={[
              styles.iconContainer,
              status === 'out-for-delivery' ? styles.activeIcon : styles.inactiveIcon,
            ]}
          >
            <Icon name="truck" size={20} color="white" />
          </View>
          <Text style={styles.statusText}>Out for Delivery</Text>
        </View>
        
        <View style={styles.statusSection}>
          <View
            style={[
              styles.iconContainer,
              status === 'delivered' ? styles.activeIcon : styles.inactiveIcon,
            ]}
          >
            <Icon name="check-circle" size={20} color="white" />
          </View>
          <Text style={styles.statusText}>Delivered</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBar,
            {
              width:
                status === 'ordered'
                  ? '0%'
                  : status === 'out-for-delivery'
                  ? '50%'
                  : '100%',
            },
          ]}
        />
      </View>
    </View>
  );
};


const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('token') 
        console.log("here")
      const response = await axios.get(`${API_BASE_URL}/customer/corporate/myorders`, {
        headers: {
          token: token
        }
      });
     
      
       
      // Flatten the order details from each order
      const allOrderDetails = response.data.data.flatMap(order => order.order_details);
      console.log(allOrderDetails)
      setOrders(allOrderDetails);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {orders.map((order, index) => (
        <OrderCard key={index} order={order} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    color:'#000000'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color:'#000000'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    color:'#000000'
  },
  foodType: {
    fontSize: 18,
    fontWeight: '600',
    color:'#000000'
  },
  date: {
    color: '#6b7280',
  },
  priceInfo: {
    alignItems: 'flex-end',
    color:'#000000'
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#000000'
  },
  quantity: {
    color: '#6b7280',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    color:'#000000'
  },
  statusSection: {
    alignItems: 'center',
    width: '33%',
    color:'#000000'
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    color:'#000000'
  },
  activeIcon: {
    backgroundColor: '#3b82f6',
  },
  inactiveIcon: {
    backgroundColor: '#dbeafe',
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3b82f6',
  },
});

export default OrderList;
