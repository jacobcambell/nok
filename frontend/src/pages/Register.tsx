import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import Center from '../Center';
import { Theme } from '../Theme';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import * as SecureStore from 'expo-secure-store';

const Register = ({ navigation }: { navigation: any }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCPassword] = useState('');
    const auth = getAuth();

    const handleSignup = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                alert('Error when signing up');
            });
    }

    return (
        <Center>
            <View style={styles.content}>
                <Text style={styles.header}>Sign Up</Text>

                <TextInput onChangeText={e => setEmail(e)} placeholder="Email" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>
                <TextInput onChangeText={e => setPassword(e)} secureTextEntry={true} placeholder="Password" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>
                <TextInput onChangeText={e => setCPassword(e)} secureTextEntry={true} placeholder="Confirm Password" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>

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

export default Register;