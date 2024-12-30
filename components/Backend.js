import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
const API_BASE_URL = 'https://dev.caterorange.com/api';

const Backend = () => {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [entries, setEntries] = useState([]);

  // Function to fetch entries from the database
  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/entries`);
      setEntries(response.data); // Assuming the response contains an array of entries
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (name && idNumber) {
      try {
        await axios.post(`${API_BASE_URL}/entry`, { name, id_number: idNumber });
        Alert.alert('Success', 'Entry added successfully!');
        setName('');  // Clear input fields
        setIdNumber('');
        fetchEntries();  // Refresh entries after adding
      } catch (error) {
        console.error('Error adding entry:', error);
        Alert.alert('Error', 'Failed to add entry');
      }
    } else {
      Alert.alert('Validation', 'Please fill out all fields');
    }
  };

  // Fetch entries when the component mounts
  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Entry</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter ID Number"
        value={idNumber}
        keyboardType="numeric"
        onChangeText={(text) => setIdNumber(text)}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>

      <ScrollView style={styles.entriesContainer}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.cardText}>Name: {entry.name}</Text>
            <Text style={styles.cardText}>ID Number: {entry.id_number}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10, // Add some margin to position the button
  },
  entriesContainer: {
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
  },
});

export default Backend;
