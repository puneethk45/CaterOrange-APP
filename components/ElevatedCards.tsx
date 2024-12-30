import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function ElevatedCards() {
  return (
    <View>
      <Text style ={styles.headingText}>ElevatedCards</Text>
      <ScrollView horizontal={true} style ={styles.container}>
        <View style ={[styles.card,styles.cardelevated]}>
            <Text>Hello</Text>

        </View>
        <View style ={[styles.card,styles.cardelevated]}>
            <Text>Welcome</Text>

        </View>
        <View style ={[styles.card,styles.cardelevated]}>
            <Text>To</Text>

        </View>
        <View style ={[styles.card,styles.cardelevated]}>
            <Text>React</Text>

        </View>
        <View style ={[styles.card,styles.cardelevated]}>
            <Text>Native</Text>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
    headingText:{
        fontSize : 24,
        fontWeight : 'bold',
        paddingHorizontal :20
       
    },
    container:
    {
        padding : 8
    },
    card : {
        flex :1,
        alignItems :'center',
        justifyContent : 'center',
        width : 100,
        height :100,
        margin : 8,
        borderRadius : 3
    },
    cardelevated : {
       backgroundColor : '#82b4bf',
       
    }
})