import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NativeStackScreenProps} from '@react-navigation/native-stack'
import ProductItem from './ProductItem'
import Separator from './Separator'
import { PRODUCTS_LIST } from '../productConstants'

import { RootStackParamList } from '../AppPro'
type HomeProps = NativeStackScreenProps<RootStackParamList,"Home">
const Home = ({navigation} : HomeProps) => {
  return (
    <View style={styles.container}>
        <FlatList 
        data={PRODUCTS_LIST}
        keyExtractor={item =>item.id}
        ItemSeparatorComponent={Separator}
        renderItem={({item}) => (

            <Pressable onPress={() => {navigation.navigate('Details',{product:item})}}>

                <ProductItem product={item} />
            </Pressable>
        )} />
      
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    
        padding: 12,
        backgroundColor: '#FFFFFF',
      }
})