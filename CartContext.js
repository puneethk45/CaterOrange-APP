import React, { createContext, useContext, useState } from 'react';

// Create Cart Context
const CartContext = createContext();

// Create a custom hook to use the CartContext
export const useCart = () => {
    return useContext(CartContext);
};

// Cart Provider component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addItemToCart = (item) => {
        setCartItems((prevItems) => [...prevItems, item]);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const removeItemFromCart = (itemToRemove) => {
        setCartItems((prevItems) =>
            prevItems.filter(item => item.date !== itemToRemove.date || item.foodType !== itemToRemove.foodType)
        );
    };
    const updateItemQuantity = (itemToUpdate, change) => {
        setCartItems((prevItems) => {
            return prevItems.map(item => {
                // Check if the current item matches the one to update
                if (item.date === itemToUpdate.date && item.foodType === itemToUpdate.foodType) {
                    const newQuantity = item.quantity + change;

                    // Only update if the new quantity is greater than or equal to 1
                    if (newQuantity >= 1) {
                        return { ...item, quantity: newQuantity };
                    }
                }
                return item; // Return the item unchanged if it doesn't match
            });
        });
    };

    return (
        <CartContext.Provider value={{ cartItems, addItemToCart, clearCart, removeItemFromCart,updateItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
