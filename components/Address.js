import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import {
 View,
 Text,
 TextInput,
 TouchableOpacity,
 ScrollView,
 StyleSheet,
 SafeAreaView,
 Platform,
 PermissionsAndroid,
 Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
const API_BASE_URL = 'https://dev.caterorange.com/api';

const AddressForm = ({ onAddressAdd, onAddressSelect, onClose }) => {
 // State variables
 const [tag, setTag] = useState('');
 const [pincode, setPincode] = useState('');
 const [city, setCity] = useState('');
 const [address, setAddress] = useState([]);
 const [state, setState] = useState('');
 const [flatNumber, setFlatNumber] = useState('');
 const [landmark, setLandmark] = useState('');
 const [location, setLocation] = useState({ address: '', lat: null, lng: null });
 const [shipToName, setShipToName] = useState('');
 const [shipToPhoneNumber, setShipToPhoneNumber] = useState('');
 const [isDefault, setIsDefault] = useState(false);
 const [selectedOption, setSelectedOption] = useState(null);
 const [errors, setErrors] = useState({});
 const [successMessage, setSuccessMessage] = useState('');
 const [isViewAddresses, setIsViewAddresses] = useState(false);
 const [defaultDetails, setDefaultDetails] = useState({
 customer_name: '',
 customer_phonenumber: ''
 });
 const [editableDefaultDetails, setEditableDefaultDetails] = useState({
 customer_name: '',
 customer_phonenumber: ''
 });
 const [selectedAddressId, setSelectedAddressId] = useState(null);
 const [currentLocation, setCurrentLocation] = useState({
 latitude: 17.3850, // Hyderabad's latitude
 longitude: 78.4867, // Hyderabad's longitude
 latitudeDelta: 0.0922,
 longitudeDelta: 0.0421,
 });
 const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);


 const webViewRef = useRef(null);

 
 const mapHtml = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css" />
 <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js"></script>
 <style>
 body { padding: 0; margin: 0; }
 html, body, #map {
 height: 100%;
 width: 100%;
 position: relative;
 }
 </style>
 </head>
 <body>
 <div id="map"></div>
 <script>
 let map;
 let marker;

 async function getLocationInfo(lat, lng) {
 try {
 const response = await axios.get(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
 return response.data.display_name;
 } catch (error) {
 console.error('Error fetching location info:', error);
 return 'Location information unavailable';
 }
 }

 async function initMap(lat, lng) {
 map = L.map('map').setView([lat, lng], 13);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '© OpenStreetMap contributors'
 }).addTo(map);
 
 const locationName = await getLocationInfo(lat, lng);
 marker = L.marker([lat, lng], { draggable: true }).addTo(map);
 marker.bindPopup(locationName).openPopup();
 
 window.ReactNativeWebView.postMessage(JSON.stringify({ 
 lat, 
 lng,
 address: locationName
 }));

 map.on('click', async function(e) {
 const { lat, lng } = e.latlng;
 marker.setLatLng([lat, lng]);
 const locationName = await getLocationInfo(lat, lng);
 marker.bindPopup(locationName).openPopup();
 window.ReactNativeWebView.postMessage(JSON.stringify({ 
 lat, 
 lng,
 address: locationName
 }));
 });

 marker.on('dragend', async function(e) {
 const { lat, lng } = e.target.getLatLng();
 const locationName = await getLocationInfo(lat, lng);
 marker.bindPopup(locationName).openPopup();
 window.ReactNativeWebView.postMessage(JSON.stringify({ 
 lat, 
 lng,
 address: locationName
 }));
 });
 }

 function updateMarker(lat, lng) {
 if (marker) {
 marker.setLatLng([lat, lng]);
 map.setView([lat, lng], map.getZoom());
 }
 }
 </script>
 </body>
 </html>
 `;





 useEffect(() => {
 requestLocationPermission();
 fetchDefaultDetails();
 }, []);

 const requestLocationPermission = async () => {
 try {
 if (Platform.OS === 'ios') {
 Geolocation.requestAuthorization('whenInUse');
 getCurrentLocation();
 } else {
 const granted = await PermissionsAndroid.request(
 PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
 {
 title: "Location Permission",
 message: "This app needs access to your location to show the map.",
 buttonNeutral: "Ask Me Later",
 buttonNegative: "Cancel",
 buttonPositive: "OK"
 }
 );
 if (granted === PermissionsAndroid.RESULTS.GRANTED) {
 getCurrentLocation();
 }
 }
 } catch (err) {
 console.warn(err);
 }
 };

 const getCurrentLocation = () => {
 Geolocation.getCurrentPosition(
 position => {
 const { latitude, longitude } = position.coords;
 setCurrentLocation({
 latitude,
 longitude,
 latitudeDelta: 0.0922,
 longitudeDelta: 0.0421,
 });
 setLocation({
 lat: latitude,
 lng: longitude,
 address: 'Current Location'
 });
 
 // Update map view through WebView
 if (webViewRef.current) {
 webViewRef.current.injectJavaScript(`
 updateMarker(${latitude}, ${longitude});
 true;
 `);
 }
 },
 error => console.log(error),
 { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
 );
 };

 const fetchDefaultDetails = async () => {
 try {
 const token = await AsyncStorage.getItem('token');
 console.log(token)
 if (!token) {
 throw new Error('No token found, please log in again.');
 }

 
 const response = await axios.get(`${API_BASE_URL}/address/getDefaultAddress`, {
 headers: {token }
 });
 
 const { customer_name, customer_phonenumber } = response.data.customer;
 setDefaultDetails({ customer_name, customer_phonenumber });
 setEditableDefaultDetails({ customer_name, customer_phonenumber });
 } catch (error) {
 console.error('Error fetching default address:', error);
 }
 };


 const handleLocationSelect = (event) => {
 try {
 const { lat, lng, address } = JSON.parse(event.nativeEvent.data);
 setLocation({
 lat,
 lng,
 address
 });
 setSelectedLocationInfo({
 latitude: lat,
 longitude: lng,
 address
 });
 setErrors(prevErrors => {
 const { location, ...rest } = prevErrors;
 return rest;
 });
 } catch (error) {
 console.error('Error parsing location data:', error);
 }
 };

 const handleDefaultDetailsChange = (name, value) => {
 setEditableDefaultDetails(prev => ({ ...prev, [name]: value }));
 };

 const handleViewAddresses = async () => {
 if (!isViewAddresses) {
 try {
 const token = await AsyncStorage.getItem('token');
 if (!token) {
 console.error('No token found in localStorage');
 return;
 }console.log(token)

 const response = await axios.get(`${API_BASE_URL}/address/getalladdresses`, {
 headers: {token }
 });

 if (response.data.address) {
 setAddress(response.data.address);
 console.log(response.data);
 } else {
 console.error('Failed to fetch addresses:', response.status);
 }
 } catch (error) {
 console.error('Error fetching addresses:', error);
 }
 }
 setIsViewAddresses(!isViewAddresses);
 };

 const validate = () => {
 const errors = {};

 if (!tag) errors.tag = 'Tag is required';
 if (!pincode || isNaN(pincode)) errors.pincode = 'Valid pincode is required';
 if (!city) errors.city = 'City is required';
 if (!state) errors.state = 'State is required';
 if (!location.lat || !location.lng) {
 errors.location = 'Location is required';
 } else {
 if (isNaN(location.lat) || isNaN(location.lng)) {
 errors.location = 'Valid latitude and longitude are required';
 }
 if (location.lat < -90 || location.lat > 90) {
 errors.location = 'Latitude must be between -90 and 90';
 }
 if (location.lng < -180 || location.lng > 180) {
 errors.location = 'Longitude must be between -180 and 180';
 }
 }

 if (!selectedOption) {
 errors.selectedOption = 'You must select either shipping details or set as default';
 }

 if (selectedOption === 'shipping') {
 if (!shipToName) errors.shipToName = 'Ship to name is required';
 if (!shipToPhoneNumber || isNaN(shipToPhoneNumber) || shipToPhoneNumber.length !== 10) {
 errors.shipToPhoneNumber = 'Valid 10-digit phone number is required';
 }
 }

 return errors;
 };

 const handleSubmit = async () => {
 const validationErrors = validate();
 const line1 = `${flatNumber}, ${landmark}`;
 const line2 = `${city}, ${state}`;

 if (Object.keys(validationErrors).length === 0) {
 try {
 const token = await AsyncStorage.getItem('token');
 if (!token) {
 throw new Error('No token found, please log in again.');
 }

 console.log(tag,pincode,line1,line2,shipToName,shipToPhoneNumber )
 const response = await axios.post(`${API_BASE_URL}/address/createAddres`,
 {
 tag,
 pincode,
 line1,
 line2,
 location: `{${location.lat},${location.lng}}`,
 ship_to_name: selectedOption === 'shipping' ? shipToName : editableDefaultDetails.customer_name,
 ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : editableDefaultDetails.customer_phonenumber,
 },
 {
 headers: { token }
 }
 );
 onAddressAdd();
 clearForm();
 setSuccessMessage('Address saved successfully.');
 onClose();
 } catch (error) {
 console.error('Error saving address:', error);
 setSuccessMessage('Failed to save address.');
 }
 } else {
 setErrors(validationErrors);
 }
 };

 const clearForm = () => {
 setTag('');
 setPincode('');
 setCity('');
 setState('');
 setFlatNumber('');
 setLandmark('');
 setLocation({ address: '', lat: null, lng: null });
 setShipToName('');
 setShipToPhoneNumber('');
 setIsDefault(false);
 setSelectedOption(null);
 setErrors({});
 };

 const handleSelect = async (address_id) => {
 try {
 const token = await AsyncStorage.getItem('token');
 const response = await axios.get(`${API_BASE_URL}/customer/getAddress`, {
 params: { address_id },
 headers: { token }
 });
 onAddressSelect(response.data.result);
 console.log("res",response.data);
 } catch (error) {
 console.error('Error fetching address:', error);
 }
 };

 const injectInitialLocation = () => {
 return `
 initMap(${currentLocation.latitude}, ${currentLocation.longitude});
 true;
 `;
 };

 return (
 <SafeAreaView style={styles.container}>
 
 <ScrollView>
 <View style={styles.formContainer}>
 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
 <Text style={styles.closeButtonText}>✕</Text>
 </TouchableOpacity>

 <Text style={styles.title}>Address Form</Text>

 {successMessage && (
 <Text style={[
 styles.message,
 successMessage.includes('success') ? styles.successMessage : styles.errorMessage
 ]}>
 {successMessage}
 </Text>
 )}

 <View style={styles.inputContainer}>
 <Text style={styles.label}>Address Label</Text>
 <TextInput
 style={styles.input}
 value={tag}
 onChangeText={setTag}
 placeholder="Enter address label"
 />
 {errors.tag && <Text style={styles.errorText}>{errors.tag}</Text>}
 </View>

 <View style={styles.inputContainer}>
 <Text style={styles.label}>Pincode</Text>
 <TextInput
 style={styles.input}
 value={pincode}
 onChangeText={setPincode}
 keyboardType="numeric"
 placeholder="Enter pincode"
 maxLength={6}
 />
 {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
 </View>

 <View style={styles.inputContainer}>
 <Text style={styles.label}>City</Text>
 <TextInput
 style={styles.input}
 value={city}
 onChangeText={setCity}
 placeholder="Enter city"
 />
 {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
 </View>

 <View style={styles.inputContainer}>
 <Text style={styles.label}>State</Text>
 <TextInput
 style={styles.input}
 value={state}
 onChangeText={setState}
 placeholder="Enter state"
 />
 {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
 </View>

 <View style={styles.inputContainer}>
 <Text style={styles.label}>Flat Number</Text>
 <TextInput
 style={styles.input}
 value={flatNumber}
 onChangeText={setFlatNumber}
 placeholder="Enter flat number"
 />
 </View>

 <View style={styles.inputContainer}>
 <Text style={styles.label}>Landmark</Text>
 <TextInput
 style={styles.input}
 value={landmark}
 onChangeText={setLandmark}
 placeholder="Enter landmark"
 />
 </View>

 
 <View style={styles.mapContainer}>
 <Text style={styles.label}>Location</Text>
 <View style={styles.mapWrapper}>
 <WebView
 ref={webViewRef}
 source={{ html: mapHtml }}
 style={styles.map}
 onMessage={handleLocationSelect}
 injectedJavaScript={`initMap(${currentLocation.latitude}, ${currentLocation.longitude}); true;`}
 javaScriptEnabled={true}
 scrollEnabled={false}
 onError={(syntheticEvent) => {
 const { nativeEvent } = syntheticEvent;
 console.warn('WebView error: ', nativeEvent);
 }}
 />
 </View>
 {selectedLocationInfo && (
 <View style={styles.locationInfo}>
 <Text style={styles.locationInfoText}>
 Selected Location: {selectedLocationInfo.address}
 </Text>
 <Text style={styles.locationInfoText}>
 Coordinates: {selectedLocationInfo.latitude.toFixed(4)}, {selectedLocationInfo.longitude.toFixed(4)}
 </Text>
 </View>
 )}
 {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
 </View>

 <TouchableOpacity
 style={styles.button}
 onPress={handleViewAddresses}
 >
 <Text style={styles.buttonText}>View Saved Addresses</Text>
 </TouchableOpacity>
 {isViewAddresses && (
 <View style={styles.savedAddressesContainer}>
 <Text style={styles.subtitle}>Saved Addresses</Text>
 {address.length > 0 ? (
 address.map((add) => (
 <TouchableOpacity
 key={add.address_id}
 style={styles.savedAddress}
 onPress={() => handleSelect(add.address_id)}
 >
 <View style={styles.radioContainer}>
 <View style={[
 styles.radio,
 selectedAddressId === add.address_id && styles.radioSelected
 ]} />
 <Text style={styles.addressText}>
 {add.tag}, {add.pincode}, {add.line1}, {add.line2}
 </Text>
 </View>
 </TouchableOpacity>
 ))
 ) : (
 <Text style={styles.noAddressText}>No addresses available</Text>
 )}
 </View>
 )}

 <View style={styles.optionsContainer}>
 <TouchableOpacity
 style={styles.radioButton}
 onPress={() => setSelectedOption('shipping')}
 >
 <View style={[
 styles.radio,
 selectedOption === 'shipping' && styles.radioSelected
 ]} />
 <Text style={styles.radioLabel}>Include shipping details</Text>
 </TouchableOpacity>

 {selectedOption === 'shipping' && (
 <View>
 <TextInput
 style={styles.input}
 value={shipToName}
 onChangeText={setShipToName}
 placeholder="Ship To Name"
 />
 {errors.shipToName && <Text style={styles.errorText}>{errors.shipToName}</Text>}

 <TextInput
 style={styles.input}
 value={shipToPhoneNumber}
 onChangeText={setShipToPhoneNumber}
 placeholder="Ship To Phone Number"
 keyboardType="numeric"
 maxLength={10}
 />
 {errors.shipToPhoneNumber && (
 <Text style={styles.errorText}>{errors.shipToPhoneNumber}</Text>
 )}
 </View>
 )}
 <TouchableOpacity
 style={styles.radioButton}
 onPress={() => setSelectedOption('default')}
 >
 <View style={[
 styles.radio,
 selectedOption === 'default' && styles.radioSelected
 ]} />
 <Text style={styles.radioLabel}>Set as Default details</Text>
 </TouchableOpacity>

 {selectedOption === 'default' && (
 <View>
 <TextInput
 style={styles.input}
 value={editableDefaultDetails.customer_name}
 onChangeText={(value) => handleDefaultDetailsChange('customer_name', value)}
 placeholder="Default Name"
 />
 <TextInput
 style={styles.input}
 value={editableDefaultDetails.customer_phonenumber}
 onChangeText={(value) => handleDefaultDetailsChange('customer_phonenumber', value)}
 placeholder="Default Phone Number"
 keyboardType="numeric"
 maxLength={10}
 />
 </View>
 )}
 </View>
 {errors.selectedOption && (
 <Text style={styles.errorText}>{errors.selectedOption}</Text>
 )}
 <TouchableOpacity
 style={styles.submitButton}
 onPress={handleSubmit}
 >
 <Text style={styles.buttonText}>Submit</Text>
 </TouchableOpacity>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
 };



 const styles = StyleSheet.create({
 container: {
 flex: 1,
 backgroundColor: '#fff',
 },
 formContainer: {
 padding: 16,
 position: 'relative',
 },
 closeButton: {
 position: 'absolute',
 top: 16,
 right: 16,
 padding: 8,
 zIndex: 1,
 },
 closeButtonText: {
 fontSize: 20,
 color: '#666',
 },

 title: {
 fontSize: 24,
 fontWeight: 'bold',
 marginBottom: 20,
 marginTop: 10,
 color: '#1f2937',
 },
 subtitle: {
 fontSize: 18,
 fontWeight: 'bold',
 marginBottom: 12,
 color: '#374151',
 },
 message: {
 textAlign: 'center',
 marginVertical: 12,
 padding: 12,
 borderRadius: 6,
 fontSize: 14,
 },
 successMessage: {
 backgroundColor: '#dcfce7',
 color: '#166534',
 },
 errorMessage: {
 backgroundColor: '#fee2e2',
 color: '#991b1b',
 },
 inputContainer: {
 marginBottom: 16,
 },
 label: {
 fontSize: 16,
 fontWeight: '600',
 color: '#374151',
 marginBottom: 8,
 },
 input: {
 borderWidth: 1,
 borderColor: '#d1d5db',
 borderRadius: 8,
 padding: 12,
 fontSize: 16,
 backgroundColor: '#fff',
 color: '#1f2937',
 },
 errorText: {
 color: '#dc2626',
 fontSize: 12,
 marginTop: 4,
 fontWeight: '500',
 },
 mapContainer: {
 marginBottom: 20,
 height: 300,
 },
 mapWrapper: {
 borderRadius: 8,
 overflow: 'hidden',
 borderWidth: 1,
 borderColor: '#d1d5db',
 height: '100%',
 },
 map: {
 flex: 1,
 height: '100%',
 width: '100%',
 },
 button: {
 backgroundColor: '#3b82f6',
 padding: 14,
 borderRadius: 8,
 marginVertical: 10,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.25,
 shadowRadius: 3.84,
 },
 buttonText: {
 color: '#fff',
 textAlign: 'center',
 fontWeight: '600',
 fontSize: 16,
 },
 savedAddressesContainer: {
 marginTop: 20,
 borderTopWidth: 1,
 borderTopColor: '#e5e7eb',
 paddingTop: 16,
 },
 savedAddress: {
 paddingVertical: 12,
 paddingHorizontal: 8,
 borderBottomWidth: 1,
 borderBottomColor: '#e5e7eb',
 },
 radioContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 radio: {
 width: 24,
 height: 24,
 borderRadius: 12,
 borderWidth: 2,
 borderColor: '#3b82f6',
 marginRight: 12,
 justifyContent: 'center',
 alignItems: 'center',
 },
 radioSelected: {
 backgroundColor: '#3b82f6',
 },
 addressText: {
 flex: 1,
 fontSize: 14,
 color: '#374151',
 lineHeight: 20,
 },
 noAddressText: {
 fontSize: 14,
 color: '#6b7280',
 fontStyle: 'italic',
 textAlign: 'center',
 paddingVertical: 12,
 },
 optionsContainer: {
 marginVertical: 20,
 backgroundColor: '#f9fafb',
 padding: 16,
 borderRadius: 8,
 },
 radioButton: {
 flexDirection: 'row',
 alignItems: 'center',
 marginVertical: 8,
 },
 radioLabel: {
 fontSize: 16,
 color: '#374151',
 marginLeft: 12,
 },
 submitButton: {
 backgroundColor: '#059669',
 padding: 16,
 borderRadius: 8,
 marginTop: 20,
 elevation: 2,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.25,
 shadowRadius: 3.84,
 },
 locationInfo: {
 backgroundColor: '#f3f4f6',
 padding: 12,
 marginTop: 8,
 borderRadius: 8,
 borderWidth: 1,
 },
});

export default AddressForm;