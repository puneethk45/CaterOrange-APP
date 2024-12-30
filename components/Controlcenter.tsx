import React from 'react'
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player'
import  Icon  from 'react-native-vector-icons/MaterialIcons'
import { playbackService } from '../musicPlayerServices'
import { StyleSheet,View ,Pressable} from 'react-native'

function Controlcenter() {
  const playBackState = usePlaybackState()
  const skipToNext = async () => {
    await TrackPlayer.skipToNext()
}
// Previous button
const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious()
}

const togglePlayback = async () => {
    const currentTrack = await TrackPlayer.getCurrentTrack()

    if (currentTrack !== null) {
      // Check if playbackState has a defined state and compare it with the State enum
      if (playBackState.state === State.Paused || playBackState.state === State.Ready) {
        await TrackPlayer.play()
      } else {
        await TrackPlayer.pause()
      }
    }
  }
  return (
   <View style={styles.container}>
     <Pressable onPress={skipToPrevious}>
            <Icon style={styles.icon} name="skip-previous" size={40} />
        </Pressable>
        <Pressable onPress={togglePlayback}>
            <Icon 
            style={styles.icon} 
            name={playBackState.state === State.Playing ? "pause" : "play-arrow"} 
            size={75} />
        </Pressable>
        <Pressable onPress={skipToNext}>
            <Icon style={styles.icon} name="skip-next" size={40} />
        </Pressable>

   </View>
  )
}

const styles = StyleSheet.create({
    container: {
      marginBottom: 56,
  
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      color: '#FFFFFF',
    },
    playButton: {
      marginHorizontal: 24,
    },
  });

export default Controlcenter