import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function ContactList() {
    const contacts = [
        {
            uid :1,
            name :'Puneeth',
            status : 'Rise Above Hate',
            imageUrl : 'https://avatars.githubusercontent.com/u/29747452?v=4'
        },
        {
            uid :2,
            name :'Rohit',
            status : 'Smash itt!!!',
            imageUrl : 'https://avatars.githubusercontent.com/u/25549847?v=4'
        },
        {
            uid :3,
            name :'Nani',
            status : 'The name is NANI',
            imageUrl : 'https://avatars.githubusercontent.com/u/94738352?v=4'
        }
    ]
  return (
    <View>
      <Text style={styles.headingText} >ContactList</Text>
      <ScrollView style={styles.container} scrollEnabled={false}>
        {contacts.map(({uid,name,status,imageUrl}) => (
            <View key={uid} style={styles.userCard}>
                <Image source={{uri:imageUrl}} style={styles.userImage} />
                <View>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userStatus}>{status}</Text>
                </View>
            </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
    headingText:{
        fontSize : 24,
        paddingHorizontal :20
       
    },
    container:{

    },
    userCard:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        marginBottom:3,
        backgroundColor:'#4a5254',
        padding :8,
        borderRadius:10
    },
    userImage:{

        width:60,
        height:60,
        borderRadius : 60/2,
        marginRight : 20
    },
    userName:
    {
     fontSize:16,
     fontWeight:'bold',
     color : '#dfe8eb'
     
     
    },
    userStatus:
    {
        fontSize :15
    }
})