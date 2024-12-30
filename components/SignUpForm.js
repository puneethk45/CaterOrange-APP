import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 ScrollView,
 Image,
 Dimensions,
 SafeAreaView,
 useWindowDimensions,
 Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const API_BASE_URL = 'https://dev.caterorange.com/api';
const CAROUSEL_INTERVAL = 3000;

const images = [
 { uri: "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727161124/Beige_and_Orange_Minimalist_Feminine_Fashion_Designer_Facebook_Cover_1_qnd0uz.png" },
 { uri: "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727104667/WhatsApp_Image_2024-09-23_at_20.47.25_gu19jf.jpg" },
 { uri: "https://cdn.leonardo.ai/users/8b9fa60c-fc98-4afb-b569-223446336c31/generations/f5b61c13-0d39-4b94-8f86-f9c748dae078/Leonardo_Phoenix_Vibrant_orangehued_events_menu_image_featurin_0.jpg" }
];

const SignupSchema = Yup.object().shape({
 name: Yup.string()
 .min(3, 'Name is too short')
 .max(50, 'Name is too long')
 .required('Name is required'),
 phone: Yup.string()
 .test('is-numeric', 'Phone number must contain only numbers', value => /^\d*$/.test(value))
 .test('is-exact-length', 'Phone number must be exactly 10 digits', value => value && value.length === 10)
 .required('Phone number is required'),
 email: Yup.string()
 .email('Invalid email address')
 .required('Email is required'),
 password: Yup.string()
 .min(8, 'Password must be at least 8 characters')
 .matches(
 /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
 'Password must contain at least one uppercase letter, one lowercase letter, one number'
 )
 .required('Password is required'),
 confirmPassword: Yup.string()
 .oneOf([Yup.ref('password'), null], 'Passwords must match')
 .required('Confirm password is required'),
});

const SignUpForm = ({navigation,onLoginSuccess}) => {
 const { width, height } = useWindowDimensions();
 const [orientation, setOrientation] = useState(height > width ? 'portrait' : 'landscape');
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState('');
 
 const carouselRef = useRef(null);
 const scrollRef = useRef(null);

 // Handle orientation changes
 useEffect(() => {
 const subscription = Dimensions.addEventListener('change', ({ window }) => {
 setOrientation(window.height > window.width ? 'portrait' : 'landscape');
 });

 return () => subscription?.remove();
 }, []);

 // Configure Google Sign In
 useEffect(() => {
 GoogleSignin.configure({
 scopes: ['profile', 'email'],
 webClientId: '460660697590-el1s13hom7ijh6si5ftg57n7591sccrl.apps.googleusercontent.com',
 offlineAccess: true,
 forceCodeForRefreshToken: true,
 });
 }, []);

 // Handle carousel auto-scroll
 useEffect(() => {
 const timer = setInterval(() => {
 const nextIndex = (currentImageIndex + 1) % images.length;
 setCurrentImageIndex(nextIndex);
 carouselRef.current?.scrollTo({
 x: nextIndex * (orientation === 'landscape' ? height * 0.8 : width),
 animated: true
 });
 }, CAROUSEL_INTERVAL);

 return () => clearInterval(timer);
 }, [currentImageIndex, orientation, width, height]);

 const handleSignUp = async (values, { setSubmitting, setFieldError },navigation) => {
 try {
 setIsLoading(true);
 setError('');

 const response = await axios.post(`${API_BASE_URL}/customer/register`, {
 customer_name: values.name.trim(),
 customer_email: values.email.trim().toLowerCase(),
 customer_password: values.password,
 customer_phonenumber: values.phone.trim(),
 confirm_password: values.confirmPassword,
 });
 console.log("response:",response);
 if (response.data.success) {
 if (response.data.token) {
 await AsyncStorage.setItem('token', response.data.token);
 await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
 await AsyncStorage.setItem('signupMethod','manual');
 await AsyncStorage.setItem('userInformation', JSON.stringify({
 customer_name: values.name.trim(),
 customer_email: values.email.trim().toLowerCase(),
 customer_phonenumber: values.phone.trim(),
 }));
 }
 Alert.alert(
 "Success", 
 "Account created successfully",
 [
 {
 text: "OK",
 onPress: () => {
 onLoginSuccess();
 }
 }
 ]
 ); } else {
 throw new Error(response.data.message || 'Sign up failed');
 }
 } catch (error) {
 const errorMessage = error.response?.data?.message || error.message || 'An error occurred during sign up';
 setError(errorMessage);
 Alert.alert("Error", errorMessage);
 } finally {
 setIsLoading(false);
 setSubmitting(false);
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

 const handleCarouselScroll = (event) => {
 const slideSize = orientation === 'landscape' ? height * 0.8 : width;
 const offset = event.nativeEvent.contentOffset.x;
 const index = Math.round(offset / slideSize);
 setCurrentImageIndex(index);
 };

 const getResponsiveStyles = () => {
 const baseStyles = createStyles(width, height);
 const orientationStyles = orientation === 'landscape' 
 ? landscapeStyles(width, height)
 : portraitStyles(width, height);
 
 return StyleSheet.create({
 ...baseStyles,
 ...orientationStyles
 });
 };
 const renderValidationMessage = (field, value, errors, touched) => {
 if (!value) return null;
 
 try {
 SignupSchema.validateSyncAt(field, { [field]: value });
 return <Text style={styles.successText}>✓ Valid</Text>;
 } catch (err) {
 return <Text style={styles.errorText}>{errors[field]}</Text>;
 }
 }

 const styles = getResponsiveStyles();

 return (
 <SafeAreaView style={styles.safeArea}>
 <ScrollView 
 ref={scrollRef}
 contentContainerStyle={styles.container}
 showsVerticalScrollIndicator={false}
 nestedScrollEnabled={false}
 >
 {/* Image Carousel */}
 <View style={styles.carouselContainer}>
 <ScrollView
 ref={carouselRef}
 horizontal
 pagingEnabled
 showsHorizontalScrollIndicator={false}
 onScroll={handleCarouselScroll}
 scrollEventThrottle={16}
 nestedScrollEnabled={true}
 scrollEnabled={false}
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
 <View
 key={index}
 style={[
 styles.dot,
 { backgroundColor: currentImageIndex === index ? '#FF4500' : '#D1D5DB' }
 ]}
 />
 ))}
 </View>
 </View>

 {/* Form Section */}
 <View style={styles.formScrollContainer}>
 <View style={styles.welcomeContainer}>
 <View style={styles.welcomeTag}>
 <Text style={styles.welcomeText}>WELCOME!</Text>
 </View>
 </View>

 <View style={styles.logoContainer}>
 <Text style={styles.logoText}>CATER ORANGE</Text>
 <Text style={styles.taglineText}>CRAVE. ORDER. ENJOY</Text>
 </View>

 <Formik
 initialValues={{
 name: '',
 phone: '',
 email: '',
 password: '',
 confirmPassword: ''
 }}
 validationSchema={SignupSchema}
 // onSubmit={handleSignUp}
 onSubmit={(values, formikActions) => {
 handleSignUp(values, formikActions, navigation); // Passing navigation here
 }}
 validateOnChange={true} // Enable validation on change
 >
 {({
 handleChange,
 handleBlur,
 handleSubmit,
 values,
 errors,
 touched,
 isSubmitting
 }) => (
 <View style={styles.formContainer}>
 {/* ... (keep existing header code) */}

 <View style={styles.inputsContainer}>
 <View style={styles.inputRow}>
 <View style={styles.inputWrapper}>
 <TextInput
 style={[
 styles.inputHalf,
 values.name && errors.name && styles.inputError,
 values.name && !errors.name && styles.inputSuccess
 ]}
 placeholder="Name"
 value={values.name}
 onChangeText={handleChange('name')}
 onBlur={handleBlur('name')}
 placeholderTextColor="#9CA3AF"
 />
 {renderValidationMessage('name', values.name, errors, touched)}
 </View>

 <View style={styles.inputWrapper}>
 <TextInput
 style={[
 styles.inputHalf,
 values.phone && errors.phone && styles.inputError,
 values.phone && !errors.phone && styles.inputSuccess
 ]}
 placeholder="Phone Number"
 value={values.phone}
 onChangeText={handleChange('phone')}
 onBlur={handleBlur('phone')}
 keyboardType="phone-pad"
 placeholderTextColor="#9CA3AF"
 />
 {renderValidationMessage('phone', values.phone, errors, touched)}
 </View>
 </View>

 <View style={styles.inputWrapper}>
 <TextInput
 style={[
 styles.input,
 values.email && errors.email && styles.inputError,
 values.email && !errors.email && styles.inputSuccess
 ]}
 placeholder="Email"
 value={values.email}
 onChangeText={handleChange('email')}
 onBlur={handleBlur('email')}
 keyboardType="email-address"
 autoCapitalize="none"
 placeholderTextColor="#9CA3AF"
 />
 {renderValidationMessage('email', values.email, errors, touched)}
 </View>

 <View style={styles.inputRow}>
 <View style={styles.inputWrapper}>
 <View style={styles.passwordContainer}>
 <TextInput
 style={[
 styles.inputHalf,
 values.password && errors.password && styles.inputError,
 values.password && !errors.password && styles.inputSuccess
 ]}
 placeholder="Password"
 value={values.password}
 onChangeText={handleChange('password')}
 onBlur={handleBlur('password')}
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
 {renderValidationMessage('password', values.password, errors, touched)}
 </View>

 <View style={styles.inputWrapper}>
 <View style={styles.passwordContainer}>
 <TextInput
 style={[
 styles.inputHalf,
 values.confirmPassword && errors.confirmPassword && styles.inputError,
 values.confirmPassword && !errors.confirmPassword && styles.inputSuccess
 ]}
 placeholder="Confirm Password"
 value={values.confirmPassword}
 onChangeText={handleChange('confirmPassword')}
 onBlur={handleBlur('confirmPassword')}
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
 {renderValidationMessage('confirmPassword', values.confirmPassword, errors, touched)}
 </View>
 </View>
 </View>

 <TouchableOpacity
 style={[styles.button, isLoading && styles.buttonDisabled]}
 onPress={handleSubmit}
 disabled={isLoading}
 >
 <Text style={styles.buttonText}>
 {isLoading ? 'Creating Account...' : 'Sign Up'}
 </Text>
 </TouchableOpacity>

 <View style={styles.dividerContainer}>
 <View style={styles.divider} />
 <Text style={styles.dividerText}>OR</Text>
 <View style={styles.divider} />
 </View>

 <TouchableOpacity
 style={styles.googleButton}
 onPress={handleGoogleSignIn}
 disabled={isLoading}
 >
 <Image
 source={require('../assets/google-icon.png')}
 style={styles.googleIcon}
 />
 <Text style={styles.googleButtonText}>Sign up with Google</Text>
 </TouchableOpacity>

 <View style={styles.loginContainer}>
 <Text style={styles.loginText}>Already have an account?</Text>
 <TouchableOpacity onPress={() => navigation.navigate('Login')}>
 <Text style={styles.loginLink}>Login</Text>
 </TouchableOpacity>
 </View>
 </View>
 )}
 </Formik>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
};

const createStyles = (width, height) => ({
 safeArea: {
 flex: 1,
 backgroundColor: '#FFFFFF',
 },
 container: {
 flexGrow: 1,
 },
 carouselContainer: {
 height: height * 0.3,
 width: '100%',
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
 formScrollContainer: {
 flex: 1,
 backgroundColor: '#FFFFFF',
 borderTopLeftRadius: 20,
 borderTopRightRadius: 20,
 marginTop: -20,
 paddingHorizontal: 20,
 },
 welcomeContainer: {
 alignItems: 'center',
 marginTop: 20,
 },
 welcomeTag: {
 backgroundColor: '#FF4500',
 paddingHorizontal: 15,
 paddingVertical: 5,
 borderRadius: 15,
 },
 welcomeText: {
 color: '#FFFFFF',
 fontSize: 14,
 fontWeight: 'bold',
 },
 logoContainer: {
 alignItems: 'center',
 marginVertical: 15,
 },
 logoText: {
 fontSize: 24,
 fontWeight: 'bold',
 color: '#1F2937',
 },
 taglineText: {
 fontSize: 12,
 color: '#4B5563',
 marginTop: 5,
 },
 formContainer: {
 width: '100%',
 paddingBottom: 30,
 },
 headerText: {
 fontSize: 20,
 fontWeight: '600',
 color: '#1F2937',
 marginBottom: 20,
 },
 inputsContainer: {
 gap: 15,
 },
 inputRow: {
 flexDirection: 'row',
 gap: 10,
 },
 inputWrapper: {
 flex: 1,
 },
 input: {
 height: 50,
 borderWidth: 1,
 borderColor: '#E5E7EB',
 borderRadius: 8,
 paddingHorizontal: 15,
 fontSize: 16,
 color: '#1F2937',
 backgroundColor: '#F9FAFB',
 },
 inputHalf: {
 height: 50,
 borderWidth: 1,
 borderColor: '#E5E7EB',
 borderRadius: 8,
 paddingHorizontal: 15,
 fontSize: 16,
 color: '#1F2937',
 backgroundColor: '#F9FAFB',
 flex: 1,
 },
 inputError: {
 borderColor: '#EF4444',
 },
 passwordContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 },
 eyeIcon: {
 position: 'absolute',
 right: 15,
 height: '100%',
 justifyContent: 'center',
 },
 errorText: {
 color: '#EF4444',
 fontSize: 12,
 marginTop: 5,
 },
 button: {
 backgroundColor: '#FF4500',
 height: 50,
 borderRadius: 8,
 justifyContent: 'center',
 alignItems: 'center',
 marginTop: 20,
 },
 buttonDisabled: {
 opacity: 0.7,
 },
 buttonText: {
 color: '#FFFFFF',
 fontSize: 16,
 fontWeight: '600',
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
 dividerText: {
 marginHorizontal: 10,
 color: '#6B7280',
 fontSize: 14,
 },
 googleButton: {
 flexDirection: 'row',
 height: 50,
 borderRadius: 8,
 borderWidth: 1,
 borderColor: '#E5E7EB',
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#FFFFFF',
 },
 googleIcon: {
 width: 24,
 height: 24,
 marginRight: 10,
 },
 googleButtonText: {
 color: '#1F2937',
 fontSize: 16,
 fontWeight: '500',
 },
 loginContainer: {
 flexDirection: 'row',
 justifyContent: 'center',
 alignItems: 'center',
 marginTop: 20,
 },
 loginText: {
 color: '#6B7280',
 fontSize: 14,
 },
 loginLink: {
 color: '#FF4500',
 fontSize: 14,
 fontWeight: '600',
 marginLeft: 5,
 },
 inputError: {
 borderColor: '#EF4444',
 },
 inputSuccess: {
 borderColor: '#10B981',
 },
 errorText: {
 color: '#EF4444',
 fontSize: 12,
 marginTop: 5,
 },
 successText: {
 color: '#10B981',
 fontSize: 12,
 marginTop: 5,
 },
});

const landscapeStyles = (width, height) => ({
 carouselContainer: {
 height: height * 0.4,
 },
 formScrollContainer: {
 paddingHorizontal: 40,
 },
});

const portraitStyles = (width, height) => ({
 carouselContainer: {
 height: height * 0.3,
 },
 formScrollContainer: {
 paddingHorizontal: 20,
 },
});

export default SignUpForm;
