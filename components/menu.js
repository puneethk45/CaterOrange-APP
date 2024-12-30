// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import {StyleSheet,View,Text,Image,ScrollView,TouchableOpacity,Animated,Dimensions,FlatList,Modal,TextInput,Switch,ActivityIndicator} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import CartModel from './CartModel';

// const { width } = Dimensions.get('window');

// const FoodOrderApp = ({ route }) => {


//   // State for data fetching and organization
//   const [products, setProducts] = useState([]);
//   const [categorizedProducts, setCategorizedProducts] = useState({});
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [selectedSearchCategory, setSelectedSearchCategory] = useState(null);
//   const [switchStates, setSwitchStates] = useState({});
//   const [toggleStates, setToggleStates] = useState({});
//   const [selectedUnits, setSelectedUnits] = useState({});


//   // Existing states
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [searchVisible, setSearchVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isVegOnly, setIsVegOnly] = useState(false);
//   const [cartModalVisible, setCartModalVisible] = useState(false);
//   const [expandedCategories, setExpandedCategories] = useState({});
//   const [checkedItems, setCheckedItems] = useState({});

//   const scrollX = useRef(new Animated.Value(0)).current;
//   const categoryScrollRef = useRef(null);
//   const categoryScale = useRef(new Animated.Value(1)).current;
//   const cartBounce = useRef(new Animated.Value(1)).current;
//   const { guests } = route.params || 1;
//   console.log("guests",guests);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         // const response = await axios.get('https://dev.caterorange.com/api/products');

//         const response = await axios.get('https://dev.caterorange.com/api/products', { timeout: 10000 });
//                 // console.log(response.data);
//         if (Array.isArray(response.data)) {
//           setProducts(response.data);
          
//           const productsByCategory = {};
//           response.data.forEach(product => {
//             if (!productsByCategory[product.category_name]) {
//               productsByCategory[product.category_name] = [];
//             }
//             productsByCategory[product.category_name].push(product);
//           });
          
//           setCategorizedProducts(productsByCategory);
//           setCategories(Object.keys(productsByCategory));
//           setFilteredCategories(Object.keys(productsByCategory));
          
//           const initialExpandedState = {};
//           const initialToggleState = {};
//           const initialSelectedUnits = {};
          
//           response.data.forEach(product => {
//             initialToggleState[product.product_id] = false;
//             initialSelectedUnits[product.product_id] = product.plate_units;
//           });
          
//           setToggleStates(initialToggleState);
//           setSelectedUnits(initialSelectedUnits);
//           setExpandedCategories(initialExpandedState);
          
//         } else {
//           throw new Error('Invalid data format received from API');
//         }
//       } catch (err) {
//         console.error('API Error:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     if (text) {
//       const filtered = categories.filter(category =>
//         category.toLowerCase().includes(text.toLowerCase())
//       );
//       setFilteredCategories(filtered);
//     } else {
//       setFilteredCategories(categories);
//     }
//   };

//   const handleCategorySelect = (category) => {
//     setSearchVisible(false);
//     setExpandedCategories(prev => ({
//       ...prev,
//       [category]: true
//     }));
//     const categoryIndex = categories.indexOf(category);
//     if (categoryScrollRef.current && categoryIndex !== -1) {
//       categoryScrollRef.current.scrollToIndex({
//         index: categoryIndex,
//         animated: true
//       });
//     }
//   };


//   const SearchModal = ({ 
//     searchVisible, 
//     setSearchVisible, 
//     searchQuery, 
//     handleSearch, 
//     filteredCategories, 
//     handleCategorySelect 
//   }) => {
//     return (
//       <Modal
//         animationType="slide"
//         transparent={false}
//         visible={searchVisible}
//         onRequestClose={() => setSearchVisible(false)}
//       >
//         <SafeAreaView style={styles.searchModalContainer}>
//           <View style={styles.searchModalHeader}>
//             <TouchableOpacity 
//               onPress={() => setSearchVisible(false)}
//               style={styles.backButton}
//             >
//               <Icon name="arrow-back" size={24} color="#333" />
//             </TouchableOpacity>
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search categories..."
//               value={searchQuery}
//               onChangeText={handleSearch}
//               autoFocus
//               placeholderTextColor="#999"
//             />
//           </View>
//           <FlatList
//             data={filteredCategories}
//             keyExtractor={(item) => item}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.searchResultItem}
//                 onPress={() => handleCategorySelect(item)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.itemContainer}>
//                   <View style={styles.imageContainer}>
//                     <Image
//                       source={{ 
//                         uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783'
//                       }}
//                       style={styles.categoryImage}
//                     />
//                   </View>
//                   <Text style={styles.searchResultText}>{item}</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//           />
//         </SafeAreaView>
//       </Modal>
//     );
//   };


//   const toggleCartItem = (item) => {
//     setCartItems(prevItems => {
//       const existingItem = prevItems.find(cartItem => cartItem.product_id === item.product_id);
      
//       if (existingItem) {
//         const newItems = prevItems.filter(cartItem => cartItem.product_id !== item.product_id);
//         setCheckedItems(prev => ({
//           ...prev,
//           [item.product_id]: false
//         }));
//         return newItems;
//       } else {
//         const isToggled = toggleStates[item.product_id];
//         const selectedUnit = isToggled ? item.wtorvol_units : item.plate_units;
        
//         setCheckedItems(prev => ({
//           ...prev,
//           [item.product_id]: true
//         }));
//         return [...prevItems, { 
//           ...item, 
//           quantity: 1,
//           selectedUnit: selectedUnit,
//           isToggled: isToggled
//         }];
//       }
//     });

//     Animated.sequence([
//       Animated.spring(cartBounce, {
//         toValue: 1.2,
//         useNativeDriver: true,
//       }),
//       Animated.spring(cartBounce, {
//         toValue: 1,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };


//   const CategoryItem = ({ categoryName, products }) => {
//     const isExpanded = expandedCategories[categoryName];

//     const toggleCategory = () => {
//       setExpandedCategories(prev => ({
//         ...prev,
//         [categoryName]: !prev[categoryName]
//       }));
//     };


//     const scaleAnim = useRef(new Animated.Value(1)).current;

//     useEffect(() => {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(scaleAnim, {
//             toValue: 1.1,
//             duration: 500,
//             useNativeDriver: true,
//           }),
//           Animated.timing(scaleAnim, {
//             toValue: 1,
//             duration: 500,
//             useNativeDriver: true,
//           }),
//         ]),
//       ).start();
//     }, [scaleAnim]);

//     return (
//       <View style={styles.categoryContainer}>
//         <TouchableOpacity
//           style={styles.categoryItem}
//           onPress={toggleCategory}
//         >
//           <View style={styles.categoryImageContainer}>
//             <Image
//               source={{ uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783' }}
//               style={styles.categoryImage}
//             />
//           </View>
//           <Text style={styles.categoryName}>{categoryName}</Text>

//         {/* <Text style={styles.subcategoryCount}>{products.length}</Text> */}
//         <View style={styles.iconAndBadgeContainer}>
//             <Icon
//               name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
//               size={24}
//               color="#333"
//             />
//             <Animated.View style={[styles.subcategoryBadge, { transform: [{ scale: scaleAnim }] }]}>
//               <Text style={styles.subcategoryCount}>{products.length}</Text>
//             </Animated.View>
//           </View>

//         </TouchableOpacity>
//         {isExpanded && (
//           <View style={styles.subcategoriesContainer}>
//             {products.map((product) => (
//               <SubCategoryItem key={product.product_id} item={product} />
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };


//   const SubCategoryItem = ({ item }) => {
//     const isInCart = cartItems.some(cartItem => cartItem.product_id === item.product_id);
//     const isChecked = checkedItems[item.product_id] || false;
//     const isToggled = toggleStates[item.product_id] || false;

//     const handleToggle = () => {
//       setToggleStates(prev => ({
//         ...prev,
//         [item.product_id]: !prev[item.product_id]
//       }));
      
//       setSelectedUnits(prev => ({
//         ...prev,
//         [item.product_id]: !isToggled ? item.wtorvol_units : item.plate_units
//       }));

//       // If item is in cart, update the cart item with new unit
//       if (isInCart) {
//         setCartItems(prev => prev.map(cartItem => {
//           if (cartItem.product_id === item.product_id) {
//             return {
//               ...cartItem,
//               selectedUnit: !isToggled ? item.wtorvol_units : item.plate_units,
//               isToggled: !isToggled
//             };
//           }
//           return cartItem;
//         }));
//       }
//     };

//     return (
//       <Animated.View style={styles.subCategoryItem}>
//         <View style={styles.subCategoryContent}>
//           <View style={styles.itemHeader}>
//             <View style={styles.categoryImageContainer}>
//               <Image
//                 source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8' }}
//                 style={styles.categoryImage}
//               />
//             </View>
//             <View style={styles.headerRight}>
//               <Text style={styles.subCategoryName}>{item.productname}</Text>
//               {item.isdual && (
//                 <Switch
//                   trackColor={{ false: "#767577", true: "#81b0ff" }}
//                   thumbColor={isToggled ? "#f5dd4b" : "#f4f3f4"}
//                   onValueChange={handleToggle}
//                   value={isToggled}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.bottomSection}>
//             <View style={styles.actionsContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.addButton,
//                   isInCart && styles.removeButton
//                 ]}
//                 onPress={() => toggleCartItem(item)}>
//                 <Text style={styles.addButtonText}>
//                   {isInCart ? 'REMOVE' : 'ADD'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.priceContainer}>
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <Icon name="ramen-dining" size={16} color="#000" style={{ marginRight: 10 }}/>
//                 <Text style={styles.price}>
//                   {isToggled ? item.wtorvol_units : item.plate_units}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Animated.View>
//     );
//   };

//   const updateQuantity = (product_id, change) => {
//     setCartItems(prevItems => {
//       const updatedItems = prevItems.map(item => {
//         if (item.product_id === product_id) {
//           const newQuantity = item.quantity + change;
//           if (newQuantity <= 0) {
//             setCheckedItems(prev => ({
//               ...prev,
//               [product_id]: false
//             }));
//             return null;
//           }
//           return { ...item, quantity: newQuantity };
//         }
//         return item;
//       }).filter(Boolean);

//       if (updatedItems.length === 0) {
//         setCheckedItems({});
//       }

//       return updatedItems;
//     });
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//       <ActivityIndicator size="large" color="#0000ff" />
//       <Text style={styles.loadingText}>loading....</Text>
//     </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.locationContainer}>
//           <Icon name="fastfood" size={24} color="#90EE90" />
//           {/* <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
//         <Icon name="fastfood" size={24} color="#90EE90" />
//       </TouchableOpacity> */}
//           <Text style={styles.locationText}>EVENTS MENU</Text>
//         </View>
//         <Animated.View style={[styles.cartContainer, { transform: [{ scale: cartBounce }] }]}>
//           <TouchableOpacity onPress={() => setCartModalVisible(true)}>
//             <Icon name="shopping-cart" size={24} color="#90EE90" />
//             {cartItems.length > 0 && (
//               <View style={styles.cartBadge}>
//                 <Text style={styles.cartBadgeText}>
//                   {cartItems.reduce((total, item) => total + item.quantity, 0)}
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </Animated.View>
//       </View>

//       <View style={styles.searchBar}>
//         <TouchableOpacity 
//           style={styles.filterButton}
//           onPress={() => setSearchVisible(true)}
//         >
//           <Icon name="search" size={20} color="red" />
//           <Text style={styles.filterText}>Search Categories here..</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         ref={categoryScrollRef}
//         data={categories}
//         keyExtractor={(category) => category}
//         renderItem={({ item: category }) => (
//           <CategoryItem 
//             categoryName={category}
//             products={categorizedProducts[category]}
//           />
//         )}
//         contentContainerStyle={styles.categoriesContainer}
//       />

//       <SearchModal
//         searchVisible={searchVisible}
//         setSearchVisible={setSearchVisible}
//         searchQuery={searchQuery}
//         handleSearch={handleSearch}
//         filteredCategories={filteredCategories}
//         handleCategorySelect={handleCategorySelect}
//       />

// <CartModel 
//   cartModalVisible={cartModalVisible}
//   setCartModalVisible={setCartModalVisible}
// //   cartItems={cartItems}
//   updateQuantity={updateQuantity}
//   toggleStates={toggleStates}
//   setToggleStates={setToggleStates}
//   guests = {guests}


// />
  
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   searchModalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   searchModalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     backgroundColor: '#fff',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     color: '#333',
//   },
//   listContainer: {
//     paddingVertical: 8,
//   },
//   searchResultItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   imageContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginRight: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   categoryImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   searchResultText: {
//     fontSize: 16,
//     color: 'green',
//     fontWeight: '500',
//   },
//   seeMoreButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     marginTop: 8,
//   },
//   seeMoreText: {
//     color: '#FF4757',
//     marginRight: 4,
//     fontWeight: '600',
//   },
//   priceCategory: {
//     fontSize: 14,
//     color: '#666',
//     marginRight: 10,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 16,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   emptyCartText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginVertical: 20,
//     color: '#666',
//   },
//   cartItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   cartItemName: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   cartItemPrice: {
//     fontSize: 14,
//     color: '#FF4757',
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 20,
//     padding: 4,
//   },
//   quantityButton: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     margin: 2,
//   },
//   quantityText: {
//     marginHorizontal: 12,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   checkoutButton: {
//     backgroundColor: '#FF4757',
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   checkoutButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     // backgroundColor:'#90EE90'
//   },
//   locationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   locationText: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginLeft: 4,
//     color:'Black'
 
//   },
//   cartContainer: {
//     position: 'relative',
//   },
//   cartBadge: {
//     position: 'absolute',
//     right: -8,
//     top: -8,
//     backgroundColor: '#FF4757',
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
// searchBar: {
//   flexDirection: 'row',
//   padding: 12,
//   borderBottomWidth: 1,
//   borderBottomColor: '#eee',
//   borderRadius: 5, // Add border radius for rounded corners
//   backgroundColor: '#fff', // Optional: set a background color for better visibility
//   shadowColor: '#000', // Shadow color
//   shadowOffset: {
//     width: 0,
//     height: 2, // Vertical shadow
//   },
//   shadowOpacity: 0.3, // Shadow opacity
//   shadowRadius: 4, // Shadow blur radius
//   elevation: 2, // For Android shadow effect
// },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#f5f5f5',
//     marginRight: 8,
//   },
//   activeFilter: {
//     backgroundColor: '#FFE5E7',
//   },
//   filterText: {
//     marginHorizontal: 4,
//     color: '#666',
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     padding: 16,
//     paddingBottom: 8,
//   },
//   categoriesContainer: {
//     marginBottom: 16,
//   },
//   categoriesList: {
//     paddingHorizontal: 8,
//   },

// categoryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     paddingHorizontal: 15,
//     justifyContent: 'space-between',
//   },

//   subcategoryCount: {
//     fontSize: 14,
//     color: '#FF6347',              // White color for contrast
//     fontWeight: 'bold',            // Bold text for emphasis
//   },
//   iconAndBadgeContainer: {
//     flexDirection: 'column',       // Stack vertically
//     alignItems: 'center',          // Center both horizontally
//   },

//   // categoryItem: {
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   justifyContent: 'space-between',
//   //   paddingVertical: 10,
//   //   paddingHorizontal: 15,
//   // },
//   categoryImageContainer: {
//     width: 60,
//     height: 60,

//     borderRadius: 30,
//     overflow: 'hidden',
//     marginRight: 16,
//     backgroundColor: '#f5f5f5',
//   },

//   categoryName: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },


// subcategoriesContainer: {
//     marginTop: 10,
//     paddingHorizontal: 10,
//   },

//   subCategoryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   subCategoriesList: {
//     padding: 16,
//   },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor:'#F0FFF0'
//   },
//   loadingText: {
//     color: 'red', 
//     fontSize: 16,      
//     marginTop: 10,     
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     textAlign: 'center',
//   },



//   vegBadge: {
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     alignSelf: 'flex-start',
//     marginBottom: 8,
//   },
//   vegText: {
//     color: '#2E7D32',
//     fontSize: 12,
//     fontWeight: '500',
//   },


//   container: {
//     flex: 1,
//     backgroundColor: '#F9F9F9',
//   },
//   scrollContainer: {
//     paddingBottom: 20,
//   },
//   categoryContainer: {
//     width: width - 10,
//     backgroundColor: '#90EE90',
//     marginVertical: 10,
//     alignSelf: 'center',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   categoryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//     justifyContent: 'space-between',
//   },
//   categoryImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
//   categoryName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginLeft: 10,
//     flex: 1,
//   },

//   subcategoriesContainer: {
//     backgroundColor: '#F2F2F2',
//     paddingHorizontal: 15,
//   },
//   subCategoryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // paddingVertical: 10,
//     borderBottomColor: '#DDD',
//     borderBottomWidth: 1,
//   },

  


//   subCategoryPrice: {
//     fontSize: 16,
//     color: '#333',
//   },
  

//   subCategoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },


//   vegBadge: {
//     backgroundColor: '#d4edda',
//     borderRadius: 5,
//     padding: 5,
//     alignSelf: 'flex-start',
//   },
//   vegText: {
//     color: '#155724',
//     fontWeight: 'bold',
//   },

//   subCategoryItem: {
//     backgroundColor: '#fff',
//     marginVertical: 4,
//     marginHorizontal: 8,
//     borderRadius: 8,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },

//   // subCategoryContent: {
//   //   padding: 20,
//   // },

//   itemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },

//   // categoryImageContainer: {
//   //   width: 80,
//   //   height: 80,
//   //   borderRadius: 8,
//   //   overflow: 'hidden',
//   //   marginRight: 12,
//   // },

//   categoryImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },

//   headerRight: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },

//   subCategoryName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 10,
//   },

 
//   bottomSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//     marginTop: 10,
//   },

//   priceContainer: {
//     // width: '150%', 
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   price: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#4CAF50',
//     // marginRight:30,
//     overflow: 'hidden',
//   },

//   actionsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '50%', 
//     justifyContent: 'flex-end',
//   },

//   addButton: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 6,
//     marginRight: 70,
//   },

//   removeButton: {
//     backgroundColor: '#ff4444',
//   },

//   addButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },

//   checkbox: {
//     marginLeft: 4,
//   },

//   // Update subCategoryContent for better overall spacing
//   subCategoryContent: {
//     padding: 6,
//   },
// });

// export default FoodOrderApp;







import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {StyleSheet,View,Text,Image,ScrollView,TouchableOpacity,Animated,Dimensions,FlatList,Modal,TextInput,Switch,ActivityIndicator,Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CartModel from './CartModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sidebar from './Sidebar';

import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'https://dev.caterorange.com/api';





// Function to store the token in AsyncStorage
// const storeToken = async () => {
//  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImlkIjoiQzAwMDAwMyIsImlhdCI6MTczMDcwMTU2MiwiZXhwIjoxNzMwNzg3OTYyfQ.TgPcNkzVLTI8FmcnUF97P21_SexttH_wzUn8c2bboS0';

//  try {
//  await AsyncStorage.setItem('token', token);
//  console.log('Token stored successfully');
//  } catch (error) {
//  console.log('Failed to store the token:', error);
//  Alert.alert('Error', 'Failed to store the token. Please try again.');
//  }
// };

// console.log("token in storage",token);
// storeToken();

const FoodOrderApp = ({ route,onLogout }) => {
 

 const fetchData = async () => {
  console.log("asdfghjkl;sdfghjklsdfghjklvbnm,xcvbnmcvbnm")

 try {
 const token = await AsyncStorage.getItem('token');
 
 // Check if the token is available
 if (!token) {
 throw new Error('Token not found');
 }
 
 // Make the API request with the token in the headers
 const response = await axios.get(`${API_BASE_URL}/cart/getcart`, {
 headers: { 
 token: token 
 }
 });
 console.log("hellooo",response)

 
 // Set the cart items, defaulting to an empty array if no items found
 
 setCartItems(response.data.cartitem.cartData || []);
 
 
} catch (error) {
 console.error('Error fetching cart items:', error);
 }
 };
 useEffect(() => {
 console.log('hi')

 
  fetchData();

 
 }, []);
 const handleCartModalClose = () => {
  setCartModalVisible(false);
 fetchData()
};

 // State for data fetching and organization
 const [products, setProducts] = useState([]);
 const [categorizedProducts, setCategorizedProducts] = useState({});

 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [filteredCategories, setFilteredCategories] = useState([]);
 const [selectedSearchCategory, setSelectedSearchCategory] = useState(null);
 const [switchStates, setSwitchStates] = useState({});
 const [toggleStates, setToggleStates] = useState({});
 const [selectedUnits, setSelectedUnits] = useState({});


 // Existing states
 const [selectedCategory, setSelectedCategory] = useState(null);
 const [cartItems, setCartItems] = useState([]);
 const [searchVisible, setSearchVisible] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [isVegOnly, setIsVegOnly] = useState(false);
 const [cartModalVisible, setCartModalVisible] = useState(false);
 const [expandedCategories, setExpandedCategories] = useState({});
 const [checkedItems, setCheckedItems] = useState({});


 const scrollX = useRef(new Animated.Value(0)).current;
 const categoryScrollRef = useRef(null);
 const categoryScale = useRef(new Animated.Value(1)).current;
 const cartBounce = useRef(new Animated.Value(1)).current;
 const [categories, setCategories] = useState([]);
  const { guests,time,date } = route.params || 1;
  console.log("guests",guests,time,date);
  const [activeTab, setActiveTab] = useState('events');
  const handleNavigate = () => {
    navigation.navigate('HomeScreen');
  };

  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
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
  const navigation = useNavigation();
 useEffect(() => {
 const fetchProducts = async () => {
 try {
 // const response = await axios.get('https://dev.caterorange.com/api/products');
 const token = await AsyncStorage.getItem('token');
 const response = await axios.get(`${API_BASE_URL}/products`, {
  headers: {
    token: token,
  },
},{timeout:10000});
// console.log(response.data);
 if (Array.isArray(response.data)) {
 setProducts(response.data);
 
 const productsByCategory = {};
 response.data.forEach(product => {
 if (!productsByCategory[product.category_name]) {
 productsByCategory[product.category_name] = [];
 }
 productsByCategory[product.category_name].push(product);
 });
 
 setCategorizedProducts(productsByCategory);
 setCategories(Object.keys(productsByCategory));
 setFilteredCategories(Object.keys(productsByCategory));
 
 const initialExpandedState = {};
 const initialToggleState = {};
 const initialSelectedUnits = {};
 
 response.data.forEach(product => {
 initialToggleState[product.product_id] = false;
 initialSelectedUnits[product.product_id] = product.plate_units;
 });
 
 setToggleStates(initialToggleState);
 setSelectedUnits(initialSelectedUnits);
 setExpandedCategories(initialExpandedState);
 
 } else {
 throw new Error('Invalid data format received from API');
 }
 } catch (err) {
 console.error('API Error:', err);
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 fetchProducts();
 }, []);


 const handleSearch = (text) => {
 setSearchQuery(text);
 if (text) {
 const filtered = categories.filter(category =>
 category.toLowerCase().includes(text.toLowerCase())
 );
 setFilteredCategories(filtered);
 } else {
 setFilteredCategories(categories);
 }
 };



 const handleCategorySelect = (category) => {
 setSearchVisible(false);
 setExpandedCategories(prev => ({
 ...prev,
 [category]: true
 }));
 const categoryIndex = categories.indexOf(category);
 if (categoryScrollRef.current && categoryIndex !== -1) {
 categoryScrollRef.current.scrollToIndex({
 index: categoryIndex,
 animated: true
 });
 }
 };
const address={
 a:'dfghj',
 b:'sdfg'
}

 const SearchModal = ({ 
 searchVisible, 
 setSearchVisible, 
 searchQuery, 
 handleSearch, 
 filteredCategories, 
 handleCategorySelect 
 }) => {
 return (
 <Modal
 animationType="slide"
 transparent={false}
 visible={searchVisible}
 onRequestClose={() => setSearchVisible(false)}
 >
 <SafeAreaView style={styles.searchModalContainer}>
 <View style={styles.searchModalHeader}>
 <TouchableOpacity 
 onPress={() => setSearchVisible(false)}
 style={styles.backButton}
 >
 <Icon name="arrow-back" size={24} color="#333" />
 </TouchableOpacity>
 <TextInput
 style={styles.searchInput}
 placeholder="Search categories..."
 value={searchQuery}
 onChangeText={handleSearch}
 autoFocus
 placeholderTextColor="#999"
 />
 </View>
 <FlatList
 data={filteredCategories}
 keyExtractor={(item) => item}
 renderItem={({ item }) => (
 <TouchableOpacity
 style={styles.searchResultItem}
 onPress={() => handleCategorySelect(item)}
 activeOpacity={0.7}
 >
 <View style={styles.itemContainer}>
 <View style={styles.imageContainer}>
 <Image
 source={{ 
 uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783'
 }}
 style={styles.categoryImage}
 />
 </View>
 <Text style={styles.searchResultText}>{item}</Text>
 </View>
 </TouchableOpacity>
 )}
 showsVerticalScrollIndicator={false}
 contentContainerStyle={styles.listContainer}
 />
 </SafeAreaView>
 </Modal>
 );
 };
 const calculateItemPrice = (item) => {
  if (toggleStates[item.product_id]) {
     // cost = (item.price_per_wtorvol_units * 1000) * item.quantity * item.guests;
    costpergram = item.price_per_wtorvol_units / item.min_wtorvol_units_per_plate;
    
    costperkg = (costpergram * 1000)*item.quantity;
  return costperkg;
  } else {
  return item.priceperunit * item.quantity*guests;
  }
  };
 const toggleCartItem = (item) => {
 setCartItems(prevItems => {
 const existingItem = prevItems.find(cartItem => cartItem.product_id === item.product_id);
 
 let newItems;

 if (existingItem) {
 // Remove item from cart
 // removeItemFromBackend(item);
 newItems = prevItems.filter(cartItem => cartItem.product_id !== item.product_id);
 setCheckedItems(prev => ({
 ...prev,
 [item.product_id]: false
 }));
 } else {
 // Add new item to cart
 const isToggled = toggleStates[item.product_id];
 const selectedUnit = isToggled ? item.wtorvol_units : item.plate_units;
 
 setCheckedItems(prev => ({
 ...prev,
 [item.product_id]: true
 }));
 newItems = [...prevItems, { 
 ...item, 
 quantity: 1,
 selectedUnit: selectedUnit,
 isToggled: isToggled
 }];
 }

 // Call addItemToBackend with the new cart items
 addItemToBackend(newItems);

 return newItems; // Return the new state
 });

 // Bounce animation
 Animated.sequence([
 Animated.spring(cartBounce, {
 toValue: 1.2,
 useNativeDriver: true,
 }),
 Animated.spring(cartBounce, {
 toValue: 1,
 useNativeDriver: true,
 }),
 ]).start();

 console.log('cartitems', cartItems); // This may still show the old state due to async nature
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
//totalAmount, cartData, address, selectedDate, numberOfguests, selectedTime
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
    numberOfguests: guests,
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
          'Content-Type': 'application/json',
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
//  numberOfguests: guests,
//  selectedTime: time,
//  },
//  {
//  headers: {
//  token: token, // Add the token directly to headers
//  },
//  }
//  );
//  console.log(totalAmount)
console.log("just");
 console.log('Item added to backend cart successfully');
 } catch (error) {
 console.error('Error adding item to backend cart:', error);
 }
};


 const CategoryItem = ({ categoryName, products }) => {
 const isExpanded = expandedCategories[categoryName];

 const toggleCategory = () => {
 setExpandedCategories(prev => ({
 ...prev,
 [categoryName]: !prev[categoryName]
 }));
 };


 const scaleAnim = useRef(new Animated.Value(1)).current;

 useEffect(() => {
 Animated.loop(
 Animated.sequence([
 Animated.timing(scaleAnim, {
 toValue: 1.1,
 duration: 500,
 useNativeDriver: true,
 }),
 Animated.timing(scaleAnim, {
 toValue: 1,
 duration: 500,
 useNativeDriver: true,
 }),
 ]),
 ).start();
 }, [scaleAnim]);

 return (
 <View style={styles.categoryContainer}>
 <TouchableOpacity
 style={styles.categoryItem}
 onPress={toggleCategory}
 >
 <View style={styles.categoryImageContainer}>
 <Image
 source={{ uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783' }}
 style={styles.categoryImage}
 />
 </View>
 <Text style={styles.categoryName}>{categoryName}</Text>

 {/* <Text style={styles.subcategoryCount}>{products.length}</Text> */}
 <View style={styles.iconAndBadgeContainer}>
 <Icon
 name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
 size={24}
 color="#333"
 />
 <Animated.View style={[styles.subcategoryBadge, { transform: [{ scale: scaleAnim }] }]}>
 <Text style={styles.subcategoryCount}>{products.length}</Text>
 </Animated.View>
 </View>

 </TouchableOpacity>
 {isExpanded && (
 <View style={styles.subcategoriesContainer}>
 {products.map((product) => (
 <SubCategoryItem key={product.product_id} item={product} />
 ))}
 </View>
 )}
 </View>
 );
 };


 const SubCategoryItem = ({ item }) => {
  console.log('cart data',cartItems)
 const isInCart = cartItems.some(cartItem => cartItem.product_id === item.product_id);
 const isChecked = checkedItems[item.product_id] || false;
 const isToggled = toggleStates[item.product_id] || false;

 const handleToggle = () => {
 setToggleStates(prev => ({
 ...prev,
 [item.product_id]: !prev[item.product_id]
 }));
 
 setSelectedUnits(prev => ({
 ...prev,
 [item.product_id]: !isToggled ? item.wtorvol_units : item.plate_units
 }));

 // If item is in cart, update the cart item with new unit
 if (isInCart) {
 setCartItems(prev => prev.map(cartItem => {
 if (cartItem.product_id === item.product_id) {
 return {
 ...cartItem,
 selectedUnit: !isToggled ? item.wtorvol_units : item.plate_units,
 isToggled: !isToggled
 };
 }
 return cartItem;
 }));
 }
 };

 return (
 <Animated.View style={styles.subCategoryItem}>
 <View style={styles.subCategoryContent}>
 <View style={styles.itemHeader}>
 <View style={styles.categoryImageContainer}>
 <Image
 source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8' }}
 style={styles.categoryImage}
 />
 </View>
 <View style={styles.headerRight}>
 <Text style={styles.subCategoryName}>{item.productname}</Text>
 {item.isdual && (
 <Switch
 trackColor={{ false: "#767577", true: "#81b0ff" }}
 thumbColor={isToggled ? "#f5dd4b" : "#f4f3f4"}
 onValueChange={handleToggle}
 value={isToggled}
 />
 )}
 </View>
 </View>

 <View style={styles.bottomSection}>
 <View style={styles.actionsContainer}>
 <TouchableOpacity
 style={[
 styles.addButton,
 isInCart && styles.removeButton
 ]}
 onPress={() => toggleCartItem(item)}>
 <Text style={styles.addButtonText}>
 {isInCart ? 'REMOVE' : 'ADD'}
 </Text>
 </TouchableOpacity>
 </View>
 <View style={styles.priceContainer}>
 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
 <Icon name="ramen-dining" size={16} color="#000" style={{ marginRight: 10 }}/>
 <Text style={styles.price}>
 {isToggled ? item.wtorvol_units : item.plate_units}
 </Text>
 </View>
 </View>
 </View>
 </View>
 </Animated.View>
 );
 };

 const updateQuantity = (product_id, change) => {
 console.log('up')
 setCartItems(prevItems => {
 const updatedItems = prevItems.map(item => {
 if (item.product_id === product_id) {
 const newQuantity = item.quantity + change;
 if (newQuantity <= 0) {
 setCheckedItems(prev => ({
 ...prev,
 [product_id]: false
 }));
 return null;
 }
 return { ...item, quantity: newQuantity };
 }
 return item;
 }).filter(Boolean);



 if (updatedItems.length === 0) {
 setCheckedItems({});
 }

 return updatedItems;
 });
 };

 if (loading) {
 return (
 <View style={styles.loadingContainer}>
 <ActivityIndicator size="large" color="#0000ff" />
 <Text style={styles.loadingText}>loading....</Text>
 </View>
 );
 }
 
 if (error) {
 return (
 <View style={styles.errorContainer}>
 <Text style={styles.errorText}>Error: {error}</Text>
 </View>
 );
 }

 return (
 <SafeAreaView style={styles.container}>
 <View style={styles.header}>
 <View style={styles.locationContainer}>
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
          
        }}
      />
 <Text style={styles.locationText}>EVENTS MENU</Text>
 </View>
 <Animated.View style={[styles.cartContainer, { transform: [{ scale: cartBounce }] }]}>
 <TouchableOpacity onPress={() => setCartModalVisible(true)}>
 <Icon name="shopping-cart" size={24} color="#90EE90" />
 {cartItems.length > 0 && (
 <View style={styles.cartBadge}>
 <Text style={styles.cartBadgeText}>
 {cartItems.length}
 </Text>
 </View>
 )}
 </TouchableOpacity>
 </Animated.View>
 </View>

 <View style={styles.searchBar}>
 <TouchableOpacity 
 style={styles.filterButton}
 onPress={() => setSearchVisible(true)}
 >
 <Icon name="search" size={20} color="red" />
 <Text style={styles.filterText}>Search Categories here..</Text>
 </TouchableOpacity>
 </View>

 <FlatList
 ref={categoryScrollRef}
 data={categories}
 keyExtractor={(category) => category}
 renderItem={({ item: category }) => (
 <CategoryItem 
 categoryName={category}
 products={categorizedProducts[category]}
 />
 )}
 contentContainerStyle={styles.categoriesContainer}
 />

<View style={styles.bottomTab}>
      {/* Corporate Tab */}
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'corporate' ? styles.activeTab : styles.inactiveTab
        ]}
        onPress={() => {
            setActiveTab('events')
            handleNavigate(); // Navigate when "Events" tab is clicked
          }}
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

 <SearchModal
 searchVisible={searchVisible}
 setSearchVisible={setSearchVisible}
 searchQuery={searchQuery}
 handleSearch={handleSearch}
 filteredCategories={filteredCategories}
 handleCategorySelect={handleCategorySelect}
 />

<CartModel
 cartModalVisible={cartModalVisible}
 setCartModalVisible={handleCartModalClose}
 updateQuantity={updateQuantity}
 toggleStates={toggleStates}
 setToggleStates={setToggleStates}
 guests={guests}
 time={time}
 date={date}
/>
 
 </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 searchModalContainer: {
 flex: 1,
 backgroundColor: '#fff',
 },
 searchModalHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 padding: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 backgroundColor: '#fff',
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 backButton: {
 padding: 8,
 marginRight: 8,
 },
 searchInput: {
 flex: 1,
 fontSize: 16,
 paddingVertical: 8,
 paddingHorizontal: 12,
 color: '#333',
 },
 listContainer: {
 paddingVertical: 8,
 },
 searchResultItem: {
 paddingVertical: 12,
 paddingHorizontal: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#f0f0f0',
 },
 itemContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 imageContainer: {
 width: 50,
 height: 50,
 borderRadius: 25,
 overflow: 'hidden',
 marginRight: 16,
 backgroundColor: '#f5f5f5',
 },
 categoryImage: {
 width: '100%',
 height: '100%',
 resizeMode: 'cover',
 },
 searchResultText: {
 fontSize: 16,
 color: 'green',
 fontWeight: '500',
 },
 seeMoreButton: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 paddingVertical: 8,
 marginTop: 8,
 },
 seeMoreText: {
 color: '#FF4757',
 marginRight: 4,
 fontWeight: '600',
 },
 priceCategory: {
 fontSize: 14,
 color: '#666',
 marginRight: 10,
 },
 modalContainer: {
 flex: 1,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 justifyContent: 'flex-end',
 },
 modalContent: {
 backgroundColor: 'white',
 borderTopLeftRadius: 20,
 borderTopRightRadius: 20,
 padding: 16,
 maxHeight: '80%',
 },
 modalHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: 16,
 paddingBottom: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 modalTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 },
 emptyCartText: {
 fontSize: 16,
 textAlign: 'center',
 marginVertical: 20,
 color: '#666',
 },
 cartItem: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 paddingVertical: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 },
 cartItemName: {
 fontSize: 16,
 fontWeight: '500',
 marginBottom: 4,
 },
 cartItemPrice: {
 fontSize: 14,
 color: '#FF4757',
 },
 quantityContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 backgroundColor: '#f5f5f5',
 borderRadius: 20,
 padding: 4,
 },
 quantityButton: {
 width: 28,
 height: 28,
 borderRadius: 14,
 backgroundColor: 'white',
 justifyContent: 'center',
 alignItems: 'center',
 margin: 2,
 },
 quantityText: {
 marginHorizontal: 12,
 fontSize: 16,
 fontWeight: '500',
 },
 checkoutButton: {
 backgroundColor: '#FF4757',
 padding: 16,
 borderRadius: 12,
 marginTop: 16,
 alignItems: 'center',
 },
 checkoutButtonText: {
 color: 'white',
 fontSize: 16,
 fontWeight: 'bold',
 },
 container: {
 flex: 1,
 backgroundColor: '#fff',
 },
 header: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 padding: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 // backgroundColor:'#90EE90'
 },
 locationContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 locationText: {
  color:'#000000',
 fontSize: 20,
 fontWeight: '600',
 marginLeft: 4,
 
 },
 cartContainer: {
 position: 'relative',
 },
 cartBadge: {
 position: 'absolute',
 right: -8,
 top: -8,
 backgroundColor: '#FF4757',
 borderRadius: 10,
 width: 20,
 height: 20,
 justifyContent: 'center',
 alignItems: 'center',
 },
 cartBadgeText: {
 color: '#fff',
 fontSize: 12,
 fontWeight: 'bold',
 },
searchBar: {
 flexDirection: 'row',
 padding: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#eee',
 borderRadius: 5, // Add border radius for rounded corners
 backgroundColor: '#fff', // Optional: set a background color for better visibility
 shadowColor: '#000', // Shadow color
 shadowOffset: {
 width: 0,
 height: 2, // Vertical shadow
 },
 shadowOpacity: 0.3, // Shadow opacity
 shadowRadius: 4, // Shadow blur radius
 elevation: 2, // For Android shadow effect
},
 filterButton: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingHorizontal: 12,
 paddingVertical: 6,
 borderRadius: 20,
 backgroundColor: '#f5f5f5',
 marginRight: 8,
 },
 activeFilter: {
 backgroundColor: '#FFE5E7',
 },
 filterText: {
 marginHorizontal: 4,
 color: '#666',
 },
 sectionTitle: {
 fontSize: 20,
 fontWeight: 'bold',
 padding: 16,
 paddingBottom: 8,
 },
 categoriesContainer: {
 marginBottom: 16,
 },
 categoriesList: {
 paddingHorizontal: 8,
 },

categoryItem: {
 flexDirection: 'row',
 alignItems: 'center',
 padding: 16,
 backgroundColor: '#fff',
 borderRadius: 12,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 paddingHorizontal: 15,
 justifyContent: 'space-between',
 },

 subcategoryCount: {
 fontSize: 14,
 color: '#FF6347', // White color for contrast
 fontWeight: 'bold', // Bold text for emphasis
 },
 iconAndBadgeContainer: {
 flexDirection: 'column', // Stack vertically
 alignItems: 'center', // Center both horizontally
 },

 // categoryItem: {
 // flexDirection: 'row',
 // alignItems: 'center',
 // justifyContent: 'space-between',
 // paddingVertical: 10,
 // paddingHorizontal: 15,
 // },
 categoryImageContainer: {
 width: 60,
 height: 60,

 borderRadius: 30,
 overflow: 'hidden',
 marginRight: 16,
 backgroundColor: '#f5f5f5',
 },

 categoryName: {
 flex: 1,
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 },


subcategoriesContainer: {
 marginTop: 10,
 paddingHorizontal: 10,
 },

 subCategoryTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 padding: 16,
 backgroundColor: '#fff',
 },
 subCategoriesList: {
 padding: 16,
 },

 loadingContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor:'#F0FFF0'
 },
 loadingText: {
 color: 'red', 
 fontSize: 16, 
 marginTop: 10, 
 },
 errorContainer: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 padding: 20,
 },
 errorText: {
 color: 'red',
 fontSize: 16,
 textAlign: 'center',
 },



 vegBadge: {
 backgroundColor: '#E8F5E9',
 paddingHorizontal: 8,
 paddingVertical: 4,
 borderRadius: 4,
 alignSelf: 'flex-start',
 marginBottom: 8,
 },
 vegText: {
 color: '#2E7D32',
 fontSize: 12,
 fontWeight: '500',
 },


 container: {
 flex: 1,
 backgroundColor: '#F9F9F9',
 },
 scrollContainer: {
 paddingBottom: 20,
 },
 categoryContainer: {
 width: width - 10,
 backgroundColor: '#90EE90',
 marginVertical: 10,
 alignSelf: 'center',
 borderRadius: 8,
 overflow: 'hidden',
 },
 categoryItem: {
 flexDirection: 'row',
 alignItems: 'center',
 padding: 15,
 justifyContent: 'space-between',
 },
 categoryImage: {
 width: 60,
 height: 60,
 borderRadius: 30,
 },
 categoryName: {
 fontSize: 18,
 fontWeight: 'bold',
 color: '#333',
 marginLeft: 10,
 flex: 1,
 },

 subcategoriesContainer: {
 backgroundColor: '#F2F2F2',
 paddingHorizontal: 15,
 },
 subCategoryItem: {
 flexDirection: 'row',
 alignItems: 'center',
 // paddingVertical: 10,
 borderBottomColor: '#DDD',
 borderBottomWidth: 1,
 },

 


 subCategoryPrice: {
 fontSize: 16,
 color: '#333',
 },
 

 subCategoryHeader: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 },


 vegBadge: {
 backgroundColor: '#d4edda',
 borderRadius: 5,
 padding: 5,
 alignSelf: 'flex-start',
 },
 vegText: {
 color: '#155724',
 fontWeight: 'bold',
 },

 subCategoryItem: {
 backgroundColor: '#fff',
 marginVertical: 4,
 marginHorizontal: 8,
 borderRadius: 8,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 1 },
 shadowOpacity: 0.2,
 shadowRadius: 2,
 },

 // subCategoryContent: {
 // padding: 20,
 // },

 itemHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 8,
 },

 // categoryImageContainer: {
 // width: 80,
 // height: 80,
 // borderRadius: 8,
 // overflow: 'hidden',
 // marginRight: 12,
 // },

 categoryImage: {
 width: '100%',
 height: '100%',
 resizeMode: 'cover',
 },

 headerRight: {
 flex: 1,
 justifyContent: 'space-between',
 },

 subCategoryName: {
 fontSize: 16,
 fontWeight: '600',
 color: '#333',
 marginTop: 10,
 },

 
 bottomSection: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 paddingHorizontal: 10,
 marginTop: 10,
 },

 priceContainer: {
 // width: '150%', 
 flexDirection: 'row',
 alignItems: 'center',
 },

 price: {
 fontSize: 16,
 fontWeight: '700',
 color: '#4CAF50',
 // marginRight:30,
 overflow: 'hidden',
 },

 actionsContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 width: '50%', 
 justifyContent: 'flex-end',
 },

 addButton: {
 backgroundColor: '#4CAF50',
 paddingHorizontal: 12,
 paddingVertical: 4,
 borderRadius: 6,
 marginRight: 70,
 },

 removeButton: {
 backgroundColor: '#ff4444',
 },

 addButtonText: {
 color: 'white',
 fontWeight: 'bold',
 },

 checkbox: {
 marginLeft: 4,
 },

 // Update subCategoryContent for better overall spacing
 subCategoryContent: {
 padding: 6,
 },bottomTab: {
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

export default FoodOrderApp;
 