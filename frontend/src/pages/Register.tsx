import React, { useState, useContext } from 'react';
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import Center from '../Center';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/core';
import { AuthContext } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword } from "firebase/auth";

const Register = ({ navigation }: { navigation: any }) => {

    const { firebaseAuth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCPassword] = useState('');

    const handleSignup = () => {
        if (password !== cPassword) {
            alert('Your passwords must match');
            return;
        }

        setEmail(email.trim());

        createUserWithEmailAndPassword(firebaseAuth, email, password)
            .then(() => {
                navigation.navigate('Main');
            })
            .catch((error) => {
                alert('Error when signing up');
            });
    }

    useFocusEffect(() => {
        SecureStore.getItemAsync('firebase_idToken')
            .then(j => {
                if (j !== null) {
                    // User is already logged in
                    navigation.navigate('Main');
                }
            })
    });

    return (
        <Center>
            <View style={styles.content}>
                <Image style={styles.logo} source={{ uri: Theme.logoUrl }} />
                <Text style={styles.header}>Sign Up</Text>

                <TextInput autoCapitalize='none' onChangeText={e => setEmail(e)} placeholder="Email" style={styles.input}></TextInput>
                <TextInput onChangeText={e => setPassword(e)} secureTextEntry={true} placeholder="Password" style={styles.input}></TextInput>
                <TextInput onChangeText={e => setCPassword(e)} secureTextEntry={true} placeholder="Confirm Password" style={styles.input}></TextInput>

                <Pressable onPress={handleSignup} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </Pressable>

                <Text onPress={() => { navigation.navigate('Login') }} style={styles.smallLink}>Already have an account?</Text>
            </View>
        </Center>
    );
}

const styles = StyleSheet.create({
    content: {
        alignSelf: 'stretch',
        paddingHorizontal: 25
    },
    header: {
        fontSize: Theme.fontSizes.large,
        textAlign: 'center',
        paddingBottom: 25
    },
    logo: {
        alignSelf: 'center',
        width: 77,
        height: 35,
        marginBottom: 15
    },
    input: {
        borderWidth: 1,
        borderColor: Theme.colors.lightgrey,
        paddingVertical: 10,
        paddingHorizontal: 7,
        fontSize: Theme.fontSizes.normal,
        borderRadius: Theme.borderRadius,
        marginVertical: 10
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 5,
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: Theme.colors.black
    },
    buttonText: {
        color: Theme.colors.white,
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.normal
    },
    smallLink: {
        color: Theme.colors.white,
        fontSize: Theme.fontSizes.normal,
        marginVertical: 15,
        paddingVertical: 5,
        textAlign: 'center'

    }
});

export default Register;