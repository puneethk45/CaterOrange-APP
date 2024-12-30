import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useProgress } from 'react-native-track-player'
import Slider from '@react-native-community/slider';
import TrackPlayer from 'react-native-track-player'; // Ensure TrackPlayer is imported

const SongSlider = () => {
    const { position, duration } = useProgress(); // Use the progress from TrackPlayer

    const handleSeek = async (value: number) => {
        try {
            await TrackPlayer.seekTo(value); // Seek to the selected position
        } catch (error) {
            console.error("Error seeking track: ", error);
        }
    };

    const formatTime = (seconds: number) => {
        return new Date(seconds * 1000).toISOString().substring(14, 19);
    };

    return (
        <View>
            <Slider
                value={position}
                onSlidingComplete={handleSeek} // Use onSlidingComplete instead of onValueChange
                minimumValue={0}
                maximumValue={duration}
                thumbTintColor='#FFF'
                minimumTrackTintColor='#1DB954'
                maximumTrackTintColor='#FFF'
                style={styles.sliderContainer}
            />
            <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sliderContainer: {
        width: 350,
        height: 40,
        marginTop: 25,
        flexDirection: 'row',
    },
    timeContainer: {
        width: 340,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    time: {
        color: '#fff',
    },
});

export default SongSlider;
