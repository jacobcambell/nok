import React from "react";
import { Text, StyleSheet, View, Pressable, Image } from "react-native";
import Center from "../components/Center";
import { Theme } from "../components/Theme";
import { useFocusEffect } from "@react-navigation/core";
import * as SecureStore from 'expo-secure-store';

const Lander = ({ navigation }: { navigation: any }) => {

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
                <Text style={styles.desc}>Messages. Simplified.</Text>

                <Pressable onPress={() => { navigation.navigate('Register') }} style={[styles.button, styles.register]}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </Pressable>
                <Pressable onPress={() => { navigation.navigate('Login') }} style={[styles.button, styles.login]}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </View>
        </Center>
    );
}

const styles = StyleSheet.create({
    content: {
        alignSelf: 'stretch',
        paddingHorizontal: 25
    },
    logo: {
        alignSelf: 'center',
        width: 77,
        height: 35,
        marginBottom: 15
    },
    desc: {
        fontSize: Theme.fontSizes.medium,
        paddingBottom: 25,
        textAlign: 'center',
        color: Theme.colors.black
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 5,
        alignSelf: 'stretch',
        alignItems: 'center'
    },
    buttonText: {
        color: Theme.colors.white,
        fontWeight: 'bold'
    },
    register: {
        backgroundColor: Theme.colors.mediumblue
    },
    login: {
        backgroundColor: Theme.colors.black
    }
});

export default Lander;