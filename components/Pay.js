import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import phonepeSDK from 'react-native-phonepe-pg';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
import { useNavigation } from '@react-navigation/native';
const Pay = () => {
 
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // PhonePe UAT/Sandbox Configuration
  const CONFIG = {
    environment: 'SANDBOX',
    merchantId: 'PGTESTPAYUAT86',
    appId: '1',
    enableLogging: true,
    saltKey: '96434309-7796-489d-8924-ab56988a6076',
    saltIndex: '1',
    callbackUrl: 'https://webhook.site/callback-url'
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `MT${timestamp}${random}`;
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

  const handlePayment = async () => {
    if (!mobileNumber || !amount) {
      Alert.alert('Error', 'Please enter both mobile number and amount');
      return;
    }

    setLoading(true);
    try {
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
        amount: Math.round(Number(amount) * 100), // Ensure amount is integer
        mobileNumber: mobileNumber,
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
        Alert.alert('Success', 'Transaction initiated successfully!');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>PhonePe Payment</Text>

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="numeric"
        maxLength={10}
        value={mobileNumber}
        onChangeText={setMobileNumber}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#841584" />
      ) : (
        <Button 
          title="Pay Now" 
          onPress={handlePayment} 
          color="#841584"
          disabled={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
});

export default Pay;