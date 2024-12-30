import { StatusBar, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

export default function BGchanger() {
  const [bgcolor,setbgcolor] = useState('#ffffff')
    const generateColor = () => {
        const hexa = "0123456789ABCDEF"
        let color='#'
        for (let i = 0; i < 6; i++) {
            color+= hexa[Math.floor(Math.random()*16)]
            
        }
        setbgcolor(color)

    }
  return (
    <>
   <StatusBar backgroundColor={bgcolor}/>
   <View style ={[styles.container,{backgroundColor:bgcolor}]}>
    <TouchableOpacity onPress={generateColor}>
        <View style={styles.actionBtn}>
            <Text style={styles.actiontext}>Press me</Text>
        </View>
    </TouchableOpacity>
   </View>
    </>
  );
}

const styles = StyleSheet.create({
    container : {
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        height:900 ,
        
    },
    actionBtn:{
        borderRadius:12,
        backgroundColor:"#9bc0cc",
        paddingVertical:10,
        paddingHorizontal:40
    },
    actiontext:{
        fontSize:24,
        color:'black',
        textTransform:'capitalize'

    }
})