import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react';
import * as Yup from 'yup';
import BouncyCheckbox from "react-native-bouncy-checkbox"
const PasswordSchema = Yup.object().shape(
    {
        passwordLength : Yup.number().min(4,"Minimum of 4 CHaracters required").max(16,"Maximum of 16 Characters only").required("Length is Required")
    }
)
import { Formik } from 'formik';

export default function PasswordGenerator() {
    const [password,setpassword] = useState('')
    const [ispasswordGenerated,setispasswordGenerated] = useState(false)
    const [lowerCase,setlowerCase] = useState(true)
    const [upperCase,setUpperCase] = useState(false)
    const[numbers,setnumbers] = useState(false)
    const[symbols,setsymbols] = useState(false)

    const generatePasswordString = (passwordLength : number) =>{
        let characterList = ''
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';

const DIGITAL_CHARS = '0123456789';

const SPECIAL_CHARS = '!@#$%^&*()_+';
if(upperCase)
{
    characterList+=UPPERCASE_CHARS
}
if(lowerCase)
{
    characterList+=LOWERCASE_CHARS
}
if(numbers)
{
    characterList+=DIGITAL_CHARS
}
if(symbols)
{
    characterList+=SPECIAL_CHARS
}
const passwordResult = createPassword(characterList,passwordLength)
setpassword(passwordResult)
console.log(passwordResult)
setispasswordGenerated(true)

    }
    const createPassword = (characters:string,passwordLength:number) =>{
        let result = ''
        for (let i = 0; i < passwordLength; i++) {
            const characterIndex = Math.floor(Math.random()*characters.length) 
            result += characters.charAt(characterIndex)
            
        }
        return result
    }
    const resetPassword= () =>{
        setpassword('')
        setispasswordGenerated(false)
        setUpperCase(false)
        setlowerCase(true)
        setnumbers(false)
        setsymbols(false)
    }
  return (
    <ScrollView keyboardShouldPersistTaps="handled">
        <SafeAreaView style={styles.appContainer}>
            <Text style={styles.title}>Password Generator</Text>
            <View style={styles.formContainer}>
            <Formik
       initialValues={{ passwordLength: '' }}
      validationSchema={PasswordSchema}
      onSubmit={values => {
        console.log(values);
        generatePasswordString(+values.passwordLength)
      }}
     >
       {({
         values,
         errors,
         touched,
         isValid,
         handleChange,
         handleReset,
         handleSubmit,
       
         /* and other goodies */
       }) => (
        <>
        <View style={styles.inputWrapper}>
            <View style={styles.inputColumn}>
                <Text style={styles.heading}>Password Length</Text>
                {touched.passwordLength && errors.passwordLength && (<Text style={styles.errorText}>{errors.passwordLength}</Text>)}
            </View>
                <TextInput style={styles.inputStyle} value={values.passwordLength} onChangeText={handleChange('passwordLength')} keyboardType='numeric' />
        </View>
        <View style={styles.inputWrapper}>
            <Text style={styles.heading}>Include Lowercase</Text>
            <BouncyCheckbox isChecked={lowerCase} onPress={() => setlowerCase(!lowerCase)} fillColor='#29AB87'></BouncyCheckbox>
        </View>
        <View style={styles.inputWrapper}>
        <Text style={styles.heading}>Include Uppercase</Text>
        <BouncyCheckbox isChecked={upperCase} onPress={() => setUpperCase(!upperCase)} fillColor='#C9A0DC'></BouncyCheckbox>
        </View>
        <View style={styles.inputWrapper}>
        <Text style={styles.heading}>Include Numbers</Text>
        <BouncyCheckbox isChecked={numbers} onPress={() => setnumbers(!numbers)} fillColor='#FC80A5'></BouncyCheckbox>
        </View>
        <View style={styles.inputWrapper}>
        <Text style={styles.heading}>Include Symbols</Text>
        <BouncyCheckbox isChecked={symbols} onPress={() => setsymbols(!symbols)} fillColor='#29AB87'></BouncyCheckbox>
        </View>
        <View style={styles.formActions}>
            <TouchableOpacity disabled={!isValid} style={styles.primaryBtn} onPress={handleSubmit}><Text>Generate Password
                </Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => {handleReset();
                resetPassword()}
            }><Text>Reset</Text></TouchableOpacity>
        </View>
        </>
        
       )}
     </Formik>
        </View>
        {ispasswordGenerated ? (
            <View style={[styles.card,styles.cardElevated]}>
                <Text style={styles.subTitle}>Result:</Text>
                <Text style={styles.description}>Long Press to Copy</Text>
                <Text selectable={true} style={styles.generatedPassword}>{password}</Text>
            </View>
        ) : null}

        </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    appContainer: {
      flex: 1,
    },
    formContainer: {
      margin: 8,
      padding: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      marginBottom: 15,
    },
    subTitle: {
      fontSize: 26,
      fontWeight: '600',
      marginBottom: 2,
    },
    description: {
      color: '#758283',
      marginBottom: 8,
    },
    heading: {
      fontSize: 15,
    },
    inputWrapper: {
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    inputColumn: {
      flexDirection: 'column',
    },
    inputStyle: {
      padding: 8,
      width: '30%',
      borderWidth: 1,
      borderRadius: 4,
      borderColor: '#16213e',
    },
    errorText: {
      fontSize: 12,
      color: '#ff0d10',
    },
    formActions: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    primaryBtn: {
      width: 120,
      padding: 10,
      borderRadius: 8,
      marginHorizontal: 8,
      backgroundColor: '#5DA3FA',
    },
    primaryBtnTxt: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: '700',
    },
    secondaryBtn: {
      width: 120,
      padding: 10,
      borderRadius: 8,
      marginHorizontal: 8,
      backgroundColor: '#CAD5E2',
    },
    secondaryBtnTxt: {
      textAlign: 'center',
    },
    card: {
      padding: 12,
      borderRadius: 6,
      marginHorizontal: 12,
    },
    cardElevated: {
      backgroundColor: '#ffffff',
      elevation: 1,
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowColor: '#333',
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    generatedPassword: {
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 12,
      color:'#000'
    },
  });