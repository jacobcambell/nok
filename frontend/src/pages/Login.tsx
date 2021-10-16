import React, { useState, useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import Center from '../Center';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { signInWithEmailAndPassword } from '@firebase/auth';

const Login = ({ navigation }: { navigation: any }) => {

    const { firebaseAuth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        signInWithEmailAndPassword(firebaseAuth, email, password)
            .then(() => {
                navigation.navigate('Main');
            })
            .catch((err) => {
                alert('Error logging in');
            })
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
                <Text style={styles.header}>Login</Text>

                <TextInput onChangeText={e => setEmail(e)} placeholder="Email" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>
                <TextInput onChangeText={e => setPassword(e)} secureTextEntry={true} placeholder="Password" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>

                <Pressable onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>

                <Text onPress={() => { navigation.navigate('Register') }} style={styles.smallLink}>Don't have an account?</Text>
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
        color: Theme.colors.white,
        paddingBottom: 25
    },
    input: {
        borderWidth: 1,
        borderColor: Theme.colors.lightgrey,
        paddingVertical: 10,
        paddingHorizontal: 7,
        fontSize: Theme.fontSizes.normal,
        borderRadius: Theme.borderRadius,
        marginVertical: 10,
        color: Theme.colors.white
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 5,
        alignSelf: 'stretch',
        alignItems: 'center',
        backgroundColor: Theme.colors.grey
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

export default Login;