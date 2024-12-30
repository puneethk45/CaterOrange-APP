import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView ,PanResponder} from "react-native";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const API_BASE_URL = 'https://dev.caterorange.com/api';
import { useNavigation } from '@react-navigation/native';
import { useShowDate } from "./DateContext";
function DateComponent({ foodtype, price,image,quantity,category_id }) {
    const navigation = useNavigation();
    const [selectedDates, setSelectedDates] = useState([]);
    const [monthlyIncludedDays, setMonthlyIncludedDays] = useState({});
    const {
        showDateComponent,
        setShowDateComponent,
       
    } = useShowDate();
    const [individualToggles, setIndividualToggles] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [lastClickedDate, setLastClickedDate] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [openPicker, setOpenPicker] = useState(false);
    const [swipeStartX, setSwipeStartX] = useState(null);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();

    // Handle touch start
    const handleTouchStart = (e) => {
        setSwipeStartX(e.nativeEvent.pageX);
    };

    // Handle touch end
    const handleTouchEnd = (e) => {
        if (!swipeStartX) return;

        const swipeEndX = e.nativeEvent.pageX;
        const swipeDistance = swipeEndX - swipeStartX;
        const threshold = 50; // Minimum swipe distance to trigger a month change

        if (Math.abs(swipeDistance) >= threshold) {
            if (swipeDistance > 0) {
                handlePreviousMonth();
            } else {
                handleNextMonth();
            }
        }

        setSwipeStartX(null);
    };

    // Get calendar days for current month
    const getCalendarDays = () => {
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
        }

        return days;
    };


    


    const handlePreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const checkWeekdaySelection = (weekday, toggles) => {
        const days = getCalendarDays();
        const weekdayDates = days.filter(date => 
            date && 
            date.getDay() === weekday && 
            date >= currentDate
        );
        
        return weekdayDates.length > 0 && weekdayDates.every(date => 
            toggles[date.toDateString()]
        );
    };

    useEffect(() => {
        const updateDates = () => {
            const allSelectedDates = Object.entries(individualToggles)
                .filter(([dateStr, isSelected]) => isSelected && new Date(dateStr) >= currentDate)
                .map(([dateStr]) => new Date(dateStr));

            allSelectedDates.sort((a, b) => a - b);

            if (allSelectedDates.length > 0) {
                setFromDate(allSelectedDates[0]);
                setToDate(allSelectedDates[allSelectedDates.length - 1]);
                setSelectedDates(allSelectedDates);
            } else {
                setFromDate(null);
                setToDate(null);
                setSelectedDates([]);
            }
        };

        updateDates();
    }, [individualToggles, currentMonth]);
    
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: (_, gestureState) => {
                const threshold = 50; // Minimum swipe distance to trigger a month change
                const monthChange = Math.floor(gestureState.dx / threshold);
    
                if (monthChange !== 0) {
                    setCurrentDate((prevDate) => {
                        const newMonth = prevDate.getMonth() - monthChange; // Adjust months based on swipe
                        return new Date(prevDate.getFullYear(), newMonth, 1); // Update to the new month
                    });
                }
            },
        })
    ).current;
    
    
    // Updated handleDateClick to sync with weekday toggles
    const handleDateClick = (date) => {
        if (!date || date < currentDate) return;

        const dateStr = date.toDateString();
        const weekday = date.getDay();
        const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

        if (lastClickedDate && !individualToggles[dateStr]) {
            const dateRange = generateDateRange(lastClickedDate, date);
            const newToggles = { ...individualToggles };
            const newMonthlyIncluded = { ...monthlyIncludedDays };

            dateRange.forEach(d => {
                if (d >= currentDate) {
                    const dStr = d.toDateString();
                    newToggles[dStr] = true;
                    
                    // Update weekday toggle for the month
                    const dWeekday = d.getDay();
                    const dMonthKey = `${d.getFullYear()}-${d.getMonth()}`;
                    if (!newMonthlyIncluded[dMonthKey]) {
                        newMonthlyIncluded[dMonthKey] = {};
                    }
                    newMonthlyIncluded[dMonthKey][dWeekday] = true;
                }
            });

            setIndividualToggles(newToggles);
            setMonthlyIncludedDays(newMonthlyIncluded);
            setLastClickedDate(null);
        } else {
            const newValue = !individualToggles[dateStr];
            setIndividualToggles(prev => ({
                ...prev,
                [dateStr]: newValue
            }));

            // Update weekday toggle when selecting/deselecting a date
            setMonthlyIncludedDays(prev => {
                const newMonthlyIncluded = { ...prev };
                if (!newMonthlyIncluded[monthKey]) {
                    newMonthlyIncluded[monthKey] = {};
                }
                
                // If selecting a date, always turn on the weekday toggle
                if (newValue) {
                    newMonthlyIncluded[monthKey][weekday] = true;
                } else {
                    // If deselecting, check if any other dates for this weekday are still selected
                    const hasOtherSelectedDates = getCalendarDays()
                        .some(d => d && 
                              d.getDay() === weekday && 
                              d.toDateString() !== dateStr && 
                              individualToggles[d.toDateString()]);
                    
                    if (!hasOtherSelectedDates) {
                        newMonthlyIncluded[monthKey][weekday] = false;
                    }
                }
                return newMonthlyIncluded;
            });

            setLastClickedDate(newValue ? date : null);
        }
    };

    const generateDateRange = (start, end) => {
        const dates = [];
        const startDate = new Date(Math.min(start, end));
        const endDate = new Date(Math.max(start, end));

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }

        return dates;
    };
    const handleOrderDates = async() => {
        try {
      
            // Create a unique item ID for each food order
            const itemId = `${foodtype}_${Date.now()}`;
      
            // Format the item data
            const item = {
              foodType: foodtype,
              price: price,
              dates: selectedDates.map(date => date.toISOString()),
              image,
              quantity,
              category_id,
              total: price * quantity * selectedDates.length
            };
            console.log(item)
      
            // Make request to new Redis-based cart endpoint
            const access_token = await AsyncStorage.getItem('token'); 
            
            console.log("tok",access_token)
            if (!access_token) {
              console.error('Token is missing');
              return;
           }
           // Retrieve the token with await
            const response = await axios.post(
               `${API_BASE_URL}/cart/update`,
               { itemId, item },
               {
                  headers: {
                     token: access_token // Use the retrieved token here
                  }
               }
            );
      
            if (response.data.success) {
              console.log('Cart updated successfully');
              setShowDateComponent(false)
              navigation.navigate('Cart');
            } else {
              console.error('Failed to update cart');
            }
          } catch (error) {
            console.error('Error updating cart:', error.message);
          }
        
      };
    
    const handleIncludeDayChange = (day) => {
        const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
        const currentDayState = monthlyIncludedDays[monthKey]?.[day] || false;
        const newValue = !currentDayState;

        setMonthlyIncludedDays(prev => ({
            ...prev,
            [monthKey]: {
                ...(prev[monthKey] || {}),
                [day]: newValue
            }
        }));

        setIndividualToggles(prev => {
            const newToggles = { ...prev };
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                if (d.getDay() === day && d >= currentDate) {
                    const dateStr = new Date(d).toDateString();
                    newToggles[dateStr] = newValue;
                }
            }
            return newToggles;
        });
    };
    
    const handleClear = () => {
        setSelectedDates([]);
        setIndividualToggles({});
        setMonthlyIncludedDays({});
        setFromDate(null);
        setToDate(null);
        setLastClickedDate(null);
    };

    const handleSaveDates = () => {
        if (selectedDates.length === 0) {
            Alert.alert("Error", "Please select at least one date");
            return;
        }

        const formattedDates = selectedDates.map(date =>
            dayjs(date).format('DD/MM/YYYY')).join(', ');

        Alert.alert(
            "Confirm Save",
            `Save ${selectedDates.length} dates for ${foodtype}?\nDates: ${formattedDates}`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Add to Cart",
                    onPress: () => {
                        handleOrderDates();
                    }
                }
            ]
        );
    };

    const isDateSelected = (date) => {
        return date && individualToggles[date.toDateString()];
    };

    const isDateDisabled = (date) => {
        return date && date < currentDate;
    };

    return (
        <ScrollView style={styles.container}>
             <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Select Dates for Delivery</Text>
    </View>
            <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={handlePreviousMonth} style={styles.navigationButton}>
                    <Icon name="chevron-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                    {dayjs(currentMonth).format('MMMM YYYY')}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navigationButton}>
                    <Icon name="chevron-right" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.weekdaysContainer}>
                {weekdays.map((day, index) => (
                    <View key={day} style={styles.weekday}>
                        <Text style={styles.weekdayLabel}>{day}</Text>
                        <TouchableOpacity
                            style={[
                                styles.checkbox,
                                monthlyIncludedDays[`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`]?.[index]
                                    ? styles.checkboxSelected
                                    : {}
                            ]}
                            onPress={() => handleIncludeDayChange(index)}
                        />
                    </View>
                ))}
            </View>

            <View 
                style={styles.calendarContainer}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <View style={styles.weekdayHeader}>
                    {weekdays.map((day) => (
                        <View key={day} style={styles.weekdayHeaderCell}>
                            <Text style={styles.weekdayText}>{day}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.calendarGrid}>
                    {getCalendarDays().map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateCell,
                                isDateSelected(date) && styles.selectedDateCell,
                                isDateDisabled(date) && styles.disabledDateCell
                            ]}
                            onPress={() => handleDateClick(date)}
                            disabled={isDateDisabled(date)}
                        >
                            <Text style={styles.dateText}>
                                {date ? date.getDate() : ""}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {fromDate && toDate && (
                <View style={styles.selectedDateRange}>
                    <Text style={styles.rangeText}>
                        Selected from {dayjs(fromDate).format('DD/MM/YYYY')} to {dayjs(toDate).format('DD/MM/YYYY')}
                    </Text>
                </View>
            )}

            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveDates} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Dates</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    navigationButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    calendarWrapper: {
        width: '100%',
    },
    monthYearText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    weekdaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekday: {
        alignItems: 'center',
    },
    weekdayLabel: {
        fontSize: 14,
        color: '#555',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 4,
        marginTop: 5,
    },
    checkboxSelected: {
        backgroundColor: '#007bff',
    },
    calendarContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
    },
    weekdayHeader: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    weekdayHeaderCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    weekdayText: {
        fontWeight: 'bold',
        color: '#333',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dateCell: {
        width: '14.2857%', // 100% / 7 days
        alignItems: 'center',
        paddingVertical: 15,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDateCell: {
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    disabledDateCell: {
        opacity: 0.5,
    },
    selectedDateRange: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 5,
        backgroundColor: '#e9f7ff',
    },
    rangeText: {
        fontSize: 16,
        color: '#007bff',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    clearButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#dc3545',
        borderRadius: 5,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        padding: 15,
        backgroundColor: '#28a745',
        borderRadius: 5,
        alignItems: 'center',
        marginLeft: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },headerContainer: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24, // Slightly larger font size for emphasis
        fontWeight: '600', // Semi-bold for balance
        color: '#4A90E2', // A visually appealing blue shade
        fontFamily: 'DancingScript-Regular', // Use a custom stylish font
        textShadowColor: '#000', // Add a subtle shadow
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 1, // Slight spacing for elegance
    },
    
});

export default DateComponent;
