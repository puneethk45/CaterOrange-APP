import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
const Sidebar = ({ visible, onClose, onMyOrders, onLogout }) => {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.sidebarContainer}>
            <TouchableOpacity onPress={onMyOrders}>
              <Text style={styles.sidebarItem}>My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout}>
              <Text style={styles.sidebarItem}>Logout</Text>
            </TouchableOpacity>
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    backgroundColor: '#fff',
    width:'60%',
    height:'100%',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems:'flex-start'
  },
  sidebarItem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    paddingVertical: 8,
  },closeButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButton: {
    padding: 10,
  },
});

export default Sidebar;