import React, { useState, useEffect,useFocusEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, StyleSheet, SafeAreaView, ScrollView, Image,Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import DateComponent from './DateComponent'; // Assuming you will use this later
import FoodCard from './CardComponent'; // Ensure this component is correctly implemented

const { width, height } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../CartContext';
import { WelcomeScreen } from './WelcomeScreen';
import Sidebar from './Sidebar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const HomeScreen = ({onLogout}) => {
    const [activeTab, setActiveTab] = useState('corporate');
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [isFoodCardVisible, setIsFoodCardVisible] = useState(false); 
    const [selectedFoodType, setSelectedFoodType] = useState('');
    const[imageuri,setimageuri]=useState('')
    const[price,setPrice]=useState(0)
    const API_BASE_URL = 'https://dev.caterorange.com/api';
    const[category_id,setcategory_id]=useState(0)
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [cartItems, setCartItems] = useState([]); // State for cart items
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval;
      
        const startPolling = () => {
          fetchCartItems(); // Initial fetch
          interval = setInterval(fetchCartItems, 4000); // Fetch every 5 seconds
        };
      
        startPolling();
      
        // Cleanup on unmount
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
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
  
        console.log("items",items)
        setCartItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to fetch cart items');
        Alert.alert('Error', 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };


    const calculateTotalItems = (cartItems) => {
        return cartItems.reduce((total, item) => {
            // If the item has dateQuantities, sum up all quantities for specific dates
            if (item.dateQuantities) {
                return total + Object.values(item.dateQuantities).reduce((sum, qty) => sum + qty, 0);
            }
            // Otherwise, multiply quantity by number of dates
            return total + (item.quantity * item.dates.length);
        }, 0);
    };
    
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  const countTotalItemsByDate = (items) => {
    const dateQuantityMap = new Map();
    
    items.forEach(item => {
        // Handle items with dateQuantities (specific quantities per date)
        if (item.dateQuantities) {
            Object.entries(item.dateQuantities).forEach(([date, quantity]) => {
                const currentQuantity = dateQuantityMap.get(date) || 0;
                dateQuantityMap.set(date, currentQuantity + quantity);
            });
        } 
        // Handle items with regular quantities (same quantity for each date)
        else {
            item.dates.forEach(date => {
                const currentQuantity = dateQuantityMap.get(date) || 0;
                dateQuantityMap.set(date, currentQuantity + item.quantity);
            });
        }
    });

    // Let's see the breakdown by date
    let totalItems = 0;
    dateQuantityMap.forEach((quantity, date) => {
        console.log(`${date}: ${quantity} items`);
        totalItems += quantity;
    });
    
    return totalItems;
};
    const handleLogout = (showConfirmation = true) => {
        const performLogout = async () => {
          try {
            // Call the onLogout prop passed from App.js
            await onLogout();
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        };
    
        if (showConfirmation) {
          Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Logout", 
                onPress: performLogout,
                style: 'destructive'
              }
            ]
          );
        } else {
          performLogout();
        }
      };
    useEffect(() => {
        return () => {
            setIsFoodCardVisible(false);
            setSelectedFoodType('');
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Add focus listener for navigation
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setIsFoodCardVisible(false);
            setSelectedFoodType('');
        });

        return unsubscribe;
    }, [navigation]);

    const handleCardPress = (foodType) => {
        setSelectedFoodType(foodType);
        console.log(selectedFoodType)
        switch(foodType){
            case "Breakfast":
                setimageuri("https://b.zmtcdn.com/data/o2_assets/8dc39742916ddc369ebeb91928391b931632716660.png")
                setPrice(40)
                setcategory_id(1)
                break;
            case "Veg Lunch":
                setimageuri("https://b.zmtcdn.com/data/dish_photos/308/1fc47adabbccbe9fec48b2e3b3e14308.jpeg?output-format=webp")
                setPrice(99)
                setcategory_id(2)
                break;
            case "Non-Veg Lunch":
                setimageuri('https://b.zmtcdn.com/data/pictures/chains/2/91662/651b69964e2fbade94d28221d854aed5_o2_featured_v2.jpg')
                setPrice(129)
                setcategory_id(3)
                break;
            case "Veg Dinner":
                setimageuri('https://b.zmtcdn.com/data/pictures/chains/0/93120/93e300dc2470bd0fe1aed48ced5fec0c_o2_featured_v2.jpg')
                setPrice(99)
                setcategory_id(5)
                break;
            case "Non-Veg Dinner":
                setimageuri('https://b.zmtcdn.com/data/pictures/1/19214961/9efcc0b0e84aa0c9fe4abb63c05006e8_o2_featured_v2.jpg')
                setPrice(129)
                setcategory_id(6)
                break;
            case "Snacks":
                setimageuri('https://b.zmtcdn.com/data/pictures/chains/7/18414597/7aff5562b8a8dddc4d95f15337d25afc_o2_featured_v2.jpg')
                setPrice(49)
                setcategory_id(4)
                break;
        }
        console.log(imageuri)
        setIsFoodCardVisible(true); // Open the food card modal
    };
   const handleNavigate = () =>{
    
    navigation.navigate('Welcome')
    
   }
    const handleCloseFoodCard = () => {
        setIsFoodCardVisible(false);
        setSelectedFoodType(''); // Reset selected food type
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? (
                <View style={styles.fullscreenContainer}>
                    <LottieView
                        source={require('../assets/openingAnimation.json')}
                        autoPlay
                        loop={false}
                        onAnimationFinish={() => setIsLoading(false)}
                        style={styles.openingAnimation}
                    />
                    <Text style={styles.welcomeText}>Welcome to CaterOrange</Text>
                </View>
            ) : ( 
                <View style={styles.overlayContainer}>
                    <LottieView
                        source={require('../assets/backgroundAnimation8.json')}
                        autoPlay
                        loop
                        style={styles.backgroundAnimation}
                    />
                    <View style={styles.header}>
                        
                        {/* <TouchableOpacity onPress={() => {navigation.navigate('MyOrders')}}>
                            <Icon name="account-circle" size={32} color="#000" />
                        </TouchableOpacity> */}

<TouchableOpacity onPress={toggleSidebar}>
        <Icon name="account-circle" size={32} color="#000" />
      </TouchableOpacity>

      <Sidebar
        visible={sidebarVisible}
        onClose={toggleSidebar}
        onMyOrders={() => {
          toggleSidebar();
          navigation.navigate('MOrders');
        }}
        onLogout={() => {

          toggleSidebar();
          handleLogout()
          // Add your logout functionality here
        }}
      />
                        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <View style={styles.iconContainer}>
                <Icon name="shopping-cart" size={32} color="#000" />
                {cartItems.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{countTotalItemsByDate(cartItems)}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
                    </View>

                    <View style={styles.bannerContainer}>
                        <Text style={styles.bannerTitle}>WELCOME TO</Text>
                        <Text style={styles.bannerAppName}>CaterOrange</Text>
                    </View>
                    
                    <ScrollView>
                        <View style={styles.cardsContainer}>
                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Breakfast')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/o2_assets/8dc39742916ddc369ebeb91928391b931632716660.png' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}>BREAKFAST</Text>
                                <Text style={styles.cardSubtitle}>MORNING DELIGHTS</Text>
                                <View style={styles.discountTag}>
                                    <Text style={styles.discountText}>MIN ₹199 OFF</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Veg Lunch')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/dish_photos/308/1fc47adabbccbe9fec48b2e3b3e14308.jpeg?output-format=webp' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}> VEG LUNCH</Text>
                                <Text style={styles.cardSubtitle}>AFTERNOON SPECIALS</Text>
                                <View style={styles.deliveryTag}>
                                    <Icon name="flash-on" size={16} color="#4CAF50" />
                                    <Text style={styles.deliveryText}>30 MINS</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Non-Veg Lunch')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/pictures/chains/2/91662/651b69964e2fbade94d28221d854aed5_o2_featured_v2.jpg' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}>NON-VEG LUNCH</Text>
                                <Text style={styles.cardSubtitle}>AFTERNOON SPECIALS</Text>
                                <View style={styles.deliveryTag}>
                                    <Icon name="flash-on" size={16} color="#4CAF50" />
                                    <Text style={styles.deliveryText}>30 MINS</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Veg Dinner')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/pictures/chains/0/93120/93e300dc2470bd0fe1aed48ced5fec0c_o2_featured_v2.jpg' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}>VEG DINNER</Text>
                                <Text style={styles.cardSubtitle}>EVENING FAVORITES</Text>
                                <View style={styles.discountTag}>
                                    <Text style={styles.discountText}>UP TO 40% OFF</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Non-Veg Dinner')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/pictures/1/19214961/9efcc0b0e84aa0c9fe4abb63c05006e8_o2_featured_v2.jpg' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}>NON-VEG DINNER</Text>
                                <Text style={styles.cardSubtitle}>EVENING FAVORITES</Text>
                                <View style={styles.discountTag}>
                                    <Text style={styles.discountText}>UP TO 40% OFF</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.card} onPress={() => handleCardPress('Snacks')}>
                                <Image
                                    source={{ uri: 'https://b.zmtcdn.com/data/pictures/chains/7/18414597/7aff5562b8a8dddc4d95f15337d25afc_o2_featured_v2.jpg' }}
                                    style={styles.cardImage}
                                />
                                <Text style={styles.cardTitle}>SNACKS</Text>
                                <Text style={styles.cardSubtitle}>QUICK BITES</Text>
                                <View style={styles.deliveryTag}>
                                    <Icon name="flash-on" size={16} color="#4CAF50" />
                                    <Text style={styles.deliveryText}>15 MINS</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                            

                    </ScrollView>

                    <Modal
                        visible={isFoodCardVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={handleCloseFoodCard}
                    >
                        <View style={styles.modalContainer}>
                            <FoodCard 
                                onClose={handleCloseFoodCard} 
                                selectedFoodType={selectedFoodType}
                                image={imageuri}
                                price={price}
                                category_id={category_id}
                                navigation={navigation}
                                     />
                        </View>
                    </Modal>

                    {/* <View style={styles.bottomTab}>
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'corporate' && styles.activeTab]}
                            onPress={() => setActiveTab('corporate')}
                        >
                            <Text style={[styles.tabText, activeTab === 'corporate' && styles.activeTabText]}>Corporate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'events' && styles.activeTab]}
                            onPress={() => {setActiveTab('events') 
                                handleNavigate()
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
                        </TouchableOpacity>
                    </View> */}
                     <View style={styles.bottomTab}>
      {/* Corporate Tab */}
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'corporate' ? styles.activeTab : styles.inactiveTab
        ]}
        onPress={() => setActiveTab('corporate')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'corporate' ? styles.activeTabText : styles.inactiveTabText
          ]}
        >
          Corporate
        </Text>
      </TouchableOpacity>

      {/* Events Tab */}
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'events' ? styles.activeTab : styles.inactiveTab
        ]}
        onPress={() => {
          setActiveTab('corporate')
          handleNavigate(); // Navigate when "Events" tab is clicked
        }}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'events' ? styles.activeTabText : styles.inactiveTabText
          ]}
        >
          Events
        </Text>
      </TouchableOpacity>
      </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullscreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundAnimation: {
        position: 'absolute',
        width: width,
        height: height * 0.88,
        zIndex: 0,
        opacity: 0.5,
        left: 0,
        

    },
    openingAnimation: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    welcomeText: {
        position: 'absolute',
        top: '20%',
        left: '18%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
        fontSize: 32,
        fontWeight: 'bold',
        color: '#eb8007',
        textAlign: 'center',
        zIndex: 1,
    },
    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        position:'relative'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerContainer: {
        padding: 16,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
    },
    bannerTitle: {
        fontSize: 16,
        color: '#666',
    },
    bannerAppName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 4,
    },
    cardsContainer: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
        zIndex:1
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardImage: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    discountTag: {
        backgroundColor: '#FF9800',
        borderRadius: 5,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
    },
    deliveryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    deliveryText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#4CAF50',
    },
    bottomTab: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#4CAF50',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }, logoutbutton: {
        backgroundColor: '#ff5c5c',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        elevation: 2, // Adds a shadow for a slight 3D effect
      },
      logoutbuttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },  logoutcontainer: {
        alignItems: 'center',
        marginTop: 20,
      },
      bottomTab: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
      },
      tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
      },
      activeTab: {
        backgroundColor: '#90EE90', // Highlight color
      },
      inactiveTab: {
        backgroundColor: '#d3d3d3', // Dull color
      },
      tabText: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      activeTabText: {
        color: '#000', // Text color for active tab
      },
      inactiveTabText: {
        color: '#555', // Dull text color for inactive tab
      },
});

export default HomeScreen;
