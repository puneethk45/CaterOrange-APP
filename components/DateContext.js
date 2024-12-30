import React, { createContext, useContext, useState } from 'react';

// Create Context
const ShowDateContext = createContext();

// Create Provider
export const ShowDateProvider = ({ children }) => {
    const [showDateComponent, setShowDateComponent] = useState(false);
    const [isFoodCardVisible, setIsFoodCardVisible] = useState(false);

    return (
        <ShowDateContext.Provider
            value={{
                showDateComponent,
                setShowDateComponent,
                isFoodCardVisible,
                setIsFoodCardVisible,
            }}
        >
            {children}
        </ShowDateContext.Provider>
    );
};

// Custom Hook to Use Context
export const useShowDate = () => useContext(ShowDateContext);
