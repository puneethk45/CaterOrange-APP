import { StyleSheet, Text, View, Image, ScrollView, Linking, TouchableOpacity } from 'react-native';
import React from 'react';

export default function FancyCards() {
    function openWebsite(websiteLink: string)
    {
        Linking.openURL(websiteLink)
    }
  return (
    <View>
      <Text style={styles.headingText}>Cricketers</Text>
      <ScrollView horizontal={true}>
      <View style={[styles.card, styles.elevatedcard]}>
        <Image source={require('../assets/virat.jpg')} style={styles.cardImage} />
        <View style ={styles.cardbody}>
            <Text style = {styles.cardTitle}>Virat Kohli</Text>
            
            <Text style ={styles.cardDescription}>Kohli is regarded as one of the greatest batsmen of all time, and is regarded by many as the greatest in the modern era. He holds the highest IPL run-scorer record, ranks third in T20I, third in ODI, and stands the fourth-highest in international cricket.
            </Text>
            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={() => openWebsite('https://www.cricbuzz.com/profiles/1413/virat-kohli')}><Text style = {styles.statlinks}>Check Stats</Text></TouchableOpacity>
            </View>

        </View>
      </View>
      <View style={[styles.card, styles.elevatedcard]}>
        <Image source={require('../assets/rohit.jpeg')} style={styles.cardImage} />
        <View style ={styles.cardbody}>
            <Text style = {styles.cardTitle}>Rohit Sharma</Text>
            
            <Text style ={styles.cardDescription}>Rohit is regarded as one of the greatest batsmen of all time, and is regarded by many as the greatest in the modern era. He holds the highest IPL run-scorer record, ranks third in T20I, third in ODI, and stands the fourth-highest in international cricket.
            </Text>
            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={() => openWebsite('https://www.cricbuzz.com/profiles/1413/virat-kohli')}><Text style={styles.statlinks}>Check Stats</Text></TouchableOpacity>
            </View>

        </View>
      </View>
      <View style={[styles.card, styles.elevatedcard]}>
        <Image source={require('../assets/dhoni.jpeg')} style={styles.cardImage} />
        <View style ={styles.cardbody}>
            <Text style = {styles.cardTitle}>MS Dhoni</Text>
            
            <Text style ={styles.cardDescription}>Dhoni is regarded as one of the greatest batsmen of all time, and is regarded by many as the greatest in the modern era. He holds the highest IPL run-scorer record, ranks third in T20I, third in ODI, and stands the fourth-highest in international cricket.
            </Text>
            <View style={styles.footerContainer}>
                <TouchableOpacity onPress={() => openWebsite('https://www.cricbuzz.com/profiles/1413/virat-kohli')}><Text style={styles.statlinks}>Check Stats</Text></TouchableOpacity>
            </View>

        </View>
      </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  card: {
    width : 350,
    height : 360,
    borderRadius:5,
    marginHorizontal :12,
    marginVertical : 15
  },
  elevatedcard: {
    backgroundColor : '#e0a890'
  },
  cardImage: {
    height: 180,
    width: '100%', 
    resizeMode: 'cover'
  },
  cardbody:{
    flex : 1,
    flexGrow : 1,
    paddingHorizontal : 12
  }
  ,
  cardTitle:{
    color : 'black',
    fontWeight :'bold',
    marginBottom : 2

  },
 
  cardDescription:{
    marginBottom : 10

  },cardFooter:{

    color : 'blue',
    justifyContent: 'center'
  },
  footerContainer :{
    padding:8,
    alignItems:'center',
    justifyContent:'center'
  },
  statlinks:
  {
    fontSize:16,
    color : 'blue',
    backgroundColor : '#cee0d1',
    paddingHorizontal :20,
    paddingVertical : 6,
    borderRadius : 10

  }
});
