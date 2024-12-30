import { StyleSheet, Text, View } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { Track } from 'react-native-track-player'
type SongInfoprops =PropsWithChildren<{
    track : Track | null | undefined
}>
export default function SongInfo({track} : SongInfoprops) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.name}>{track?.title}</Text>
      </View>
      <Text style={styles.artist}>
              {track?.album}  -  {track?.artist}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginTop: 18,
    
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      },
      name: {
        marginBottom: 8,
        textAlign: 'center',
        color: '#fff',
        marginLeft:10,
        fontSize: 24,
        fontWeight: '800',
      },
      artist: {
        color: '#d9d9d9',
        textAlign: 'center',
      },
})