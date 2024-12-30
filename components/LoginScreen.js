import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, SafeAreaView, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://dev.caterorange.com/api';

const images = [
 { uri: "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727161124/Beige_and_Orange_Minimalist_Feminine_Fashion_Designer_Facebook_Cover_1_qnd0uz.png" },
 { uri: "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727104667/WhatsApp_Image_2024-09-23_at_20.47.25_gu19jf.jpg" },
 { uri: "https://cdn.leonardo.ai/users/8b9fa60c-fc98-4afb-b569-223446336c31/generations/f5b61c13-0d39-4b94-8f86-f9c748dae078/Leonardo_Phoenix_Vibrant_orangehued_events_menu_image_featurin_0.jpg" }
];

const LoginScreen = ({ navigation, onLoginSuccess }) => {
 // const navigation = useNavigation();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [forgotPassword, setForgotPassword] = useState(false);
 const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
 const [otp, setOtp] = useState('');
 const [isOtpExpired, setIsOtpExpired] = useState(false);
 const scrollViewRef = useRef(null);
 const [otpTimer, setOtpTimer] = useState(120); // 2 minutes in seconds
 const [isTimerRunning, setIsTimerRunning] = useState(false);
 const timerRef = useRef(null);
 // New validation state
 const [emailError, setEmailError] = useState('');
 const [passwordError, setPasswordError] = useState('');
 const [confirmPasswordError, setConfirmPasswordError] = useState('');
 const [otpError, setOtpError] = useState('');

 const startOtpTimer = () => {
 setIsTimerRunning(true);
 setOtpTimer(120); // Reset to 2 minutes
 
 timerRef.current = setInterval(() => {
 setOtpTimer((prevTime) => {
 if (prevTime <= 1) {
 clearInterval(timerRef.current);
 setIsTimerRunning(false);
 setIsOtpExpired(true);
 return 0;
 }
 return prevTime - 1;
 });
 }, 1000);
 };

 // Format timer display
 const formatTime = (seconds) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
 };

 // Clean up timer on component unmount
 useEffect(() => {
 return () => {
 if (timerRef.current) {
 clearInterval(timerRef.current);
 }
 };
 }, []);
 // Validation functions
 const validateEmail = (text) => {
 setEmail(text);
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!text) {
 setEmailError('Email is required');
 } else if (!emailRegex.test(text)) {
 setEmailError('Please enter a valid email address');
 } else {
 setEmailError('');
 }
 };

 const validatePassword = (text) => {
 setPassword(text);
 if (!text) {
 setPasswordError('Password is required');
 } else if (text.length < 8) {
 setPasswordError('Password must be at least 8 characters long');
 } else if (!/[A-Z]/.test(text)) {
 setPasswordError('Password must contain at least one uppercase letter');
 } else if (!/[0-9]/.test(text)) {
 setPasswordError('Password must contain at least one number');
 } else {
 setPasswordError('');
 }
 };

 const validateConfirmPassword = (text) => {
 setConfirmPassword(text);
 if (!text) {
 setConfirmPasswordError('Please confirm your password');
 } else if (text !== password) {
 setConfirmPasswordError('Passwords do not match');
 } else {
 setConfirmPasswordError('');
 }
 };

 const validateOtp = (text) => {
 setOtp(text);
 if (!text) {
 setOtpError('OTP is required');
 } else if (text.length !== 6) {
 setOtpError('OTP must be 6 digits');
 } else if (!/^\d+$/.test(text)) {
 setOtpError('OTP must contain only numbers');
 } else {
 setOtpError('');
 }
 };


 useEffect(() => {
 GoogleSignin.configure({
 scopes: ['profile', 'email'],
 webClientId: '460660697590-el1s13hom7ijh6si5ftg57n7591sccrl.apps.googleusercontent.com',
 offlineAccess: true,
 forceCodeForRefreshToken: true,
 });

 const timer = setInterval(() => {
 const nextIndex = (currentImageIndex + 1) % images.length;
 setCurrentImageIndex(nextIndex);
 scrollViewRef.current?.scrollTo({
 x: nextIndex * width,
 animated: true
 });
 }, 3000);

 return () => clearInterval(timer);
 }, [currentImageIndex]);

 const handleScroll = (event) => {
 const slideSize = event.nativeEvent.layoutMeasurement.width;
 const offset = event.nativeEvent.contentOffset.x;
 const index = Math.round(offset / slideSize);
 setCurrentImageIndex(index);
 };

 const handleSendOtp = async () => {
 if (!email) {
 setEmailError('Email is required');
 return;
 }

 setLoading(true);
 setError('');
 try {
 await axios.post(`${API_BASE_URL}/customer/checkCustomerOtp`, { email });
 const response = await axios.post(`${API_BASE_URL}/customer/send-otp`, { email });
 Alert.alert('Success', response.data.message);
 setForgotPasswordStep(2);
 setIsOtpExpired(false);
 startOtpTimer(); // Start the timer after successful OTP send
 } catch (error) {
 const errorMessage = error.response?.data?.error || 'You are not registered, please register';
 setError(errorMessage);
 Alert.alert('Error', errorMessage);
 } finally {
 setLoading(false);
 }
 };

 // Update the handleResendOtp function
 const handleResendOtp = async () => {
 if (isTimerRunning) {
 Alert.alert('Please wait', `You can request a new OTP in ${formatTime(otpTimer)}`);
 return;
 }

 setLoading(true);
 setError('');
 try {
 const response = await axios.post(`${API_BASE_URL}/customer/send-otp`, { email });
 Alert.alert('Success', response.data.message || 'OTP sent again');
 setIsOtpExpired(false);
 startOtpTimer(); // Start the timer after successful OTP resend
 setOtp(''); // Clear the OTP input
 setOtpError(''); // Clear any OTP errors
 } catch (error) {
 const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
 setError(errorMessage);
 Alert.alert('Error', errorMessage);
 } finally {
 setLoading(false);
 }
 };
 const handleVerifyOtp = async () => {
 setLoading(true);
 setError('');
 try {
 const response = await axios.post(`${API_BASE_URL}/customer/verify-otp`, { email, otp });
 Alert.alert('Success', response.data.message);
 setForgotPasswordStep(3);
 } catch (error) {
 if (error.response?.data?.error === 'OTP expired or not found') {
 setError('OTP expired, please resend OTP');
 setIsOtpExpired(true);
 Alert.alert('Error', 'OTP expired, please resend OTP');
 } else {
 const errorMessage = error.response?.data?.error || 'An error occurred while verifying OTP';
 setError(errorMessage);
 Alert.alert('Error', errorMessage);
 }
 } finally {
 setLoading(false);
 }
 };

 const handleResetPassword = async () => {
 if (password !== confirmPassword) {
 setError('Passwords do not match');
 Alert.alert('Error', 'Passwords do not match');
 return;
 }

 setLoading(true);
 setError('');
 try {
 const response = await axios.post(`${API_BASE_URL}/customer/forgotPassword`, {
 customer_email: email,
 customer_password: password,
 confirm_password: confirmPassword
 });

 if (response.data.success) {
 Alert.alert('Success', 'Password reset successfully', [
 { text: 'OK', onPress: () => {
 setForgotPassword(false);
 setForgotPasswordStep(1);
 resetForm();
 }}
 ]);
 } else {
 throw new Error(response.data.message);
 }
 } catch (error) {
 const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
 setError(errorMessage);
 Alert.alert('Error', errorMessage);
 } finally {
 setLoading(false);
 }
 };

 const resetForm = () => {
 setEmail('');
 setPassword('');
 setConfirmPassword('');
 setOtp('');
 setError('');
 };

 const handleSubmit = async () => {
 if (forgotPassword) {
 if (forgotPasswordStep === 1) {
 await handleSendOtp();
 } else if (forgotPasswordStep === 2) {
 await handleVerifyOtp();
 } else if (forgotPasswordStep === 3) {
 await handleResetPassword();
 }
 } else {
 await handleSignIn();
 }
 };
const handleSignIn = async () => {
 if (!email || !password) {
 Alert.alert('Error', 'Please fill in all fields');
 return;
 }

 setLoading(true);
 setError('');

 try {
 const response = await axios.post('https://dev.caterorange.com/api/customer/login', {
 customer_email: email,
 customer_password: password
 });

 if (response.data.success) {
 // Store all necessary data
 await Promise.all([
 AsyncStorage.setItem('token', response.data.token),
 AsyncStorage.setItem('isLoggedIn', JSON.stringify(true)),
 AsyncStorage.setItem('signupMethod', 'signin'),
 AsyncStorage.setItem('userDP', JSON.stringify({
 email,
 userName: email.split('@')[0]
 }))
 ]);

 Alert.alert(
 'Success',
 'You have successfully logged in!',
 [
 {
 text: 'OK',
 onPress: () => {
 // Call the callback to update auth state
 onLoginSuccess();
 }
 }
 ]
 );
 } else {
 setError(response.data.message);
 Alert.alert('Error', response.data.message);
 }
 } catch (error) {
 const errorMessage = error.response ? 
 error.response.data.message : 
 'An error occurred. Please try again.';
 setError(errorMessage);
 Alert.alert('Error', errorMessage);
 } finally {
 setLoading(false);
 }
};

const handleGoogleSignIn = async () => {
 try {
 setIsLoading(true);
 setError('');
 await GoogleSignin.hasPlayServices();
 await GoogleSignin.signOut();
 const userInfo = await GoogleSignin.signIn();
 console.log("userInfo",userInfo);
 const { accessToken } = await GoogleSignin.getTokens();

 const user = userInfo.data ? userInfo.data.user : userInfo.user;
 console.log("user:",user);
 if (user) {
 const customerName = user.name || 'Default Name';
 const customerEmail = user.email || 'Default Email';
 
 const response = await axios.post(`${API_BASE_URL}/customer/google_auth`, {
 customer_name: customerName,
 customer_email: customerEmail,
 access_token: accessToken
 });
 
 if (response.data.success) {
 if (response.data.token) {
 await AsyncStorage.setItem('token', response.data.token);
 await AsyncStorage.setItem('isLoggedIn',JSON.stringify(true)); //added line
 await AsyncStorage.setItem('signupMethod', 'google');
 }
 if (user) {
 console.log("userinfo setting",user);
 await AsyncStorage.setItem('userInfo', JSON.stringify(user));
 }
 
 Alert.alert(
 'Success',
 'You have successfully logged in!',
 [
 {
 text: 'OK',
 onPress: () => {
 // Call the callback to update auth state
 onLoginSuccess();
 }
 }
 ]
 );
 } else {
 throw new Error(response.data.message || 'Google sign in failed');
 }
 }
 } catch (error) {
 let errorMessage = 'An error occurred during Google sign-in';

 if (error.code === statusCodes.SIGN_IN_CANCELLED) {
 errorMessage = 'Sign in cancelled';
 } else if (error.code === statusCodes.IN_PROGRESS) {
 errorMessage = 'Sign in already in progress';
 } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
 errorMessage = 'Play services not available or needs to be updated';
 } else {
 errorMessage = error.message;
 }

 setError(errorMessage);
 Alert.alert("Error", errorMessage);
 } finally {
 setIsLoading(false);
 }
};

const renderForgotPasswordContent = () => {
 switch (forgotPasswordStep) {
 case 1:
 return (
 <View>
 <TextInput
 style={[styles.input, emailError ? styles.inputError : null]}
 placeholder="Email"
 value={email}
 onChangeText={validateEmail}
 keyboardType="email-address"
 autoCapitalize="none"
 placeholderTextColor="#9CA3AF"
 />
 {emailError ? <Text style={styles.validationError}>{emailError}</Text> : null}
 </View>
 );
 case 2:
 return (
 <View>
 <TextInput
 style={[styles.input, otpError ? styles.inputError : null]}
 placeholder="Enter OTP"
 value={otp}
 onChangeText={validateOtp}
 keyboardType="numeric"
 placeholderTextColor="#9CA3AF"
 maxLength={6}
 />
 {otpError ? <Text style={styles.validationError}>{otpError}</Text> : null}
 
 <View style={styles.otpInfoContainer}>
 {isTimerRunning ? (
 <Text style={styles.timerText}>
 Resend OTP in {formatTime(otpTimer)}
 </Text>
 ) : (
 <TouchableOpacity 
 onPress={handleResendOtp}
 style={styles.resendButton}
 disabled={isTimerRunning}
 >
 <Text style={styles.resendOtpText}>Resend OTP</Text>
 </TouchableOpacity>
 )}
 </View>
 
 <Text style={styles.otpInstructions}>
 Please enter the 6-digit OTP sent to your email address
 </Text>
 </View>
 );
 case 3:
 return (
 <View>
 <View style={styles.passwordContainer}>
 <TextInput
 style={[styles.passwordInput, passwordError ? styles.inputError : null]}
 placeholder="New Password"
 value={password}
 onChangeText={validatePassword}
 secureTextEntry={!showPassword}
 placeholderTextColor="#9CA3AF"
 />
 <TouchableOpacity 
 style={styles.eyeIcon}
 onPress={() => setShowPassword(!showPassword)}
 >
 <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
 </TouchableOpacity>
 </View>
 {passwordError ? <Text style={styles.validationError}>{passwordError}</Text> : null}
 
 <View style={styles.passwordContainer}>
 <TextInput
 style={[styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
 placeholder="Confirm New Password"
 value={confirmPassword}
 onChangeText={validateConfirmPassword}
 secureTextEntry={!showConfirmPassword}
 placeholderTextColor="#9CA3AF"
 />
 <TouchableOpacity 
 style={styles.eyeIcon}
 onPress={() => setShowConfirmPassword(!showConfirmPassword)}
 >
 <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
 </TouchableOpacity>
 </View>
 {confirmPasswordError ? <Text style={styles.validationError}>{confirmPasswordError}</Text> : null}
 </View>
 );
 default:
 return null;
 }
};

 return (
 <SafeAreaView style={styles.safeArea}>
 <ScrollView 
 contentContainerStyle={styles.container}
 showsVerticalScrollIndicator={false}
 >
 <View style={styles.carouselContainer}>
 <ScrollView
 ref={scrollViewRef}
 horizontal
 pagingEnabled
 showsHorizontalScrollIndicator={false}
 style={styles.carousel}
 onScroll={handleScroll}
 scrollEventThrottle={16}
 >
 {images.map((img, index) => (
 <Image 
 key={index} 
 source={img} 
 style={styles.image}
 resizeMode="cover"
 />
 ))}
 </ScrollView>
 <View style={styles.paginationDots}>
 {images.map((_, index) => (
 <TouchableOpacity
 key={index}
 onPress={() => {
 setCurrentImageIndex(index);
 scrollViewRef.current?.scrollTo({
 x: index * width,
 animated: true
 });
 }}
 >
 <View
 style={[
 styles.dot,
 { backgroundColor: currentImageIndex === index ? '#FF4500' : '#D1D5DB' }
 ]}
 />
 </TouchableOpacity>
 ))}
 </View>
 </View>
 <View style={styles.formContainer}>
 <Text style={styles.headerText}>CaterOrange</Text>

 <View style={styles.inputsContainer}>
 {forgotPassword ? (
 renderForgotPasswordContent()
 ) : (
 <>
 <View>
 <TextInput
 style={[styles.input, emailError ? styles.inputError : null]}
 placeholder="Email"
 value={email}
 onChangeText={validateEmail}
 keyboardType="email-address"
 autoCapitalize="none"
 placeholderTextColor="#9CA3AF"
 />
 {emailError ? <Text style={styles.validationError}>{emailError}</Text> : null}
 </View>

 <View>
 <View style={styles.passwordContainer}>
 <TextInput
 style={[styles.passwordInput, passwordError ? styles.inputError : null]}
 placeholder="Password"
 value={password}
 onChangeText={validatePassword}
 secureTextEntry={!showPassword}
 placeholderTextColor="#9CA3AF"
 />
 <TouchableOpacity 
 style={styles.eyeIcon}
 onPress={() => setShowPassword(!showPassword)}
 >
 <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
 </TouchableOpacity>
 </View>
 {passwordError ? <Text style={styles.validationError}>{passwordError}</Text> : null}
 </View>
 </>
 )}
 </View>

 {error ? <Text style={styles.errorText}>{error}</Text> : null}

 <TouchableOpacity 
 style={[styles.signInButton, loading && styles.disabledButton]}
 onPress={handleSubmit}
 disabled={loading}
 >
 <Text style={styles.signInButtonText}>
 {loading ? 'Processing...' : forgotPassword ? 
 (forgotPasswordStep === 3 ? 'Reset Password' : 'Next') : 
 'Sign In'}
 </Text>
 </TouchableOpacity>

 <View style={styles.linkContainer}>
 <TouchableOpacity onPress={() => {
 setForgotPassword(!forgotPassword);
 setForgotPasswordStep(1);
 resetForm();
 }}>
 <Text style={styles.forgotPasswordText}>
 {forgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
 </Text>
 </TouchableOpacity>
 <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
 <Text style={styles.signUpText}>Sign Up</Text>
 </TouchableOpacity>
 </View>

 {!forgotPassword && (
 <>
 <View style={styles.dividerContainer}>
 <View style={styles.divider} />
 <Text style={styles.orText}>OR</Text>
 <View style={styles.divider} />
 </View>

 <TouchableOpacity 
 style={styles.googleButton} 
 onPress={handleGoogleSignIn}
 disabled={loading}
 >
 <Image 
 source={require('../assets/google-icon.png')} // Replace with the path to your image
 style={styles.googleIcon}
 />
 <Text style={styles.googleButtonText}>Sign in with Google</Text>
 </TouchableOpacity>
 </>
 )}
 </View>
 </ScrollView>
 </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 googleIcon: {
 width: 24, // Adjust size as needed
 height: 24,
 marginRight: 8,
 },
 googleButtonText: {
 fontSize: 16,
 color: '#000',
 },
 googleButton: {
 flexDirection: 'row',
 alignItems: 'center',
 padding: 10,
 borderWidth: 1,
 borderColor: '#ccc',
 borderRadius: 5,
 backgroundColor: '#fff',
 },
 dividerContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginVertical: 20,
 },
 divider: {
 flex: 1,
 height: 1,
 backgroundColor: '#ccc',
 },
 orText: {
 marginHorizontal: 10,
 fontSize: 16,
 color: '#666',
 },
 safeArea: {
 flex: 1,
 backgroundColor: '#fff',
 },
 container: {
 flexGrow: 1,
 },
 carouselContainer: {
 height: height * 0.3,
 position: 'relative',
 },
 carousel: {
 flex: 1,
 },
 image: {
 width: width,
 height: '100%',
 },
 paginationDots: {
 flexDirection: 'row',
 position: 'absolute',
 bottom: 10,
 alignSelf: 'center',
 },
 dot: {
 width: 8,
 height: 8,
 borderRadius: 4,
 marginHorizontal: 4,
 },
 formContainer: {
 flex: 1,
 backgroundColor: '#fff',
 borderTopLeftRadius: 30,
 borderTopRightRadius: 30,
 marginTop: -20,
 paddingHorizontal: 20,
 paddingTop: 30,
 },
 headerText: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#FF4500',
 textAlign: 'center',
 marginBottom: 30,
 },
 inputsContainer: {
 gap: 15,
 marginBottom: 20,
 },
 input: {
 backgroundColor: '#F3F4F6',
 borderRadius: 10,
 padding: 15,
 color: '#1F2937',
 },
 passwordContainer: {
 position: 'relative',
 },
 passwordInput: {
 backgroundColor: '#F3F4F6',
 borderRadius: 10,
 padding: 15,
 color: '#1F2937',
 },
 eyeIcon: {
 position: 'absolute',
 right: 15,
 top: '50%',
 transform: [{ translateY: -10 }],
 },
 signInButton: {
 backgroundColor: '#FF4500',
 borderRadius: 10,
 padding: 15,
 alignItems: 'center',
 marginBottom: 15,
 },
 signInButtonText: {
 color: '#fff',
 fontWeight: '600',
 fontSize: 16,
 },
 linkContainer: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: 20,
 },
 forgotPasswordText: {
 color: '#FF4500',
 fontSize: 14,
 },
 signUpText: {
 color: '#FF4500',
 fontSize: 14,
 },
 dividerContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginVertical: 20,
 },
 divider: {
 flex: 1,
 height: 1,
 backgroundColor: '#E5E7EB',
 },
 orText: {
 color: '#6B7280',
 paddingHorizontal: 10,
 },
 googleButton: {
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center',
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 15,
 borderWidth: 1,
 borderColor: '#ddd',
 },
 googleIcon: {
 width: 20,
 height: 20,
 marginRight: 10,
 },
 googleButtonText: {
 color: '#666',
 fontWeight: '500',
 },
 errorText: {
 color: 'red',
 textAlign: 'center',
 marginBottom: 10,
 },
 disabledButton: {
 opacity: 0.7,
 },
 resendOtpText: {
 color: '#FF4500',
 textAlign: 'right',
 marginTop: 8,
 fontSize: 14,
 },
 validationError: {
 color: '#dc2626',
 fontSize: 12,
 marginTop: 4,
 marginLeft: 4,
 },
 inputError: {
 borderColor: '#dc2626',
 borderWidth: 1,
 },
 otpInfoContainer: {
 marginTop: 8,
 alignItems: 'center',
 },
 timerText: {
 color: '#4B5563',
 fontSize: 14,
 marginTop: 8,
 },
 resendButton: {
 padding: 8,
 },
 resendOtpText: {
 color: '#FF4500',
 fontSize: 14,
 fontWeight: '500',
 },
 otpInstructions: {
 color: '#6B7280',
 fontSize: 12,
 textAlign: 'center',
 marginTop: 8,
 },
});

export default LoginScreen;