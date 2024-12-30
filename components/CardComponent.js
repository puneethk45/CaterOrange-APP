import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateComponent from './DateComponent';
import { useNavigation } from '@react-navigation/native';
import  {useCart}  from '../CartContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useShowDate } from './DateContext';
const {height} = Dimensions.get('window')
const API_BASE_URL = 'https://dev.caterorange.com/api';


const FoodCard = ({selectedFoodType, onClose, image, price,category_id }) => {
  const navigation = useNavigation(); // Initialize navigation
  const [quantity, setQuantity] = useState(1);
  const {
    showDateComponent,
    setShowDateComponent,
   
} = useShowDate();
  const [selectedDates, setSelectedDates] = useState([]);
  const { addItemToCart } = useCart();
  
  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const handleAddItem = async () => {
    if (selectedDates.length === 0) {
    
      setShowDateComponent(true);
      return;
    }
   
    try {
      
      // Create a unique item ID for each food order
      const itemId = `${selectedFoodType}_${Date.now()}`;

      // Format the item data
      const item = {
        foodType: selectedFoodType,
        price: price,
        dates: selectedDates.map(date => date.toISOString()),
        image,
        quantity,
        category_id,
        total: price * quantity * selectedDates.length
      };
      console.log(item)

      // Make request to new Redis-based cart endpoint
      const access_token = await AsyncStorage.getItem('token'); 
      
      console.log("tok",access_token)
      if (!access_token) {
        console.error('Token is missing');
        return;
     }
     // Retrieve the token with await
      const response = await axios.post(
         `${API_BASE_URL}/cart/update`,
         { itemId, item },
         {
            headers: {
               token: access_token // Use the retrieved token here
            }
         }
      );

      if (response.data.success) {
        console.log('Cart updated successfully');
        setShowDateComponent(false);
        navigation.navigate('Cart');
      } else {
        console.error('Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error.message);
    }
  };
 
  const handleSaveDates = (dates) => {
    setSelectedDates(dates);
   
    const newItems = dates.map((date) => ({
        foodType: selectedFoodType,
        price: price,
        date:date.toISOString(),
        image,
        quantity,
    }));
    setShowDateComponent(false); // C
    console.log(newItems);
  };

  return (
    <>
      {!showDateComponent && (
        <View style={styles.container}>
          {/* Rest of your existing JSX code remains the same */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{selectedFoodType}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-circle" size={28} color="#333" style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: image }}
            style={styles.foodImage}
          />

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Tasty</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Chef's Special</Text>
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{selectedFoodType}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.ratingsCount}>(1.2K ratings)</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Dal+Rice+Curry+Sambar+Curd+Chutney+Roti
          </Text>

          <Text style={styles.requestLabel}>Add a cooking request (optional)</Text>
          <TextInput
            style={styles.requestInput}
            placeholder="e.g. Don't make it too spicy"
            placeholderTextColor="#aaa"
          />

          <View style={styles.bottomContainer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>
                 Order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDateComponent && (
        <DateComponent foodtype={selectedFoodType} price={price} image={image} quantity={quantity} category_id={category_id}  onClose={() => setShowDateComponent(false)}  />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.75, // 3/4 view of the screen
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    marginLeft: 10,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  ratingsCount: {
    fontSize: 12,
    color: '#777',
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginVertical: 10,
  },
  requestLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  requestInput: {
    backgroundColor: '#F2F2F2',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
    marginVertical: 10,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 16,
    color: '#000000',
  },
  quantity: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoodCard;
