import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function FlatCards() {
  return (
    <View>
      <Text style={styles.headingText}>FlatCards</Text>
      <View style={styles.container}>
        <View style={[styles.card,styles.cardOne]} >
            <Text>Red</Text>
        </View>
        <View style={[styles.card,styles.cardtwo]} >
            <Text>Blue</Text>
        </View>
        <View style={[styles.card,styles.cardthree]} >
            <Text>Green</Text>
        </View>
        
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    headingText:{
        fontSize : 24,
        fontWeight : 'bold',
        paddingHorizontal :20
       
    },
    container : {
      flex : 1,
      flexDirection :'row',
      padding: 28
    },
    card : {
       width :100,
       height :100,
       borderRadius :4,
       alignItems :'center',
       justifyContent:'center',
       margin:5
    },
    cardOne : {
       backgroundColor : '#cc2d2d'
    },
    cardtwo : {
        backgroundColor : '#1d7ccf'
     },
     cardthree : {
        backgroundColor : 'green'
     }

})