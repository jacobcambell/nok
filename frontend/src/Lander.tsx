import React from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import Center from "./Center";
import { Theme } from "./Theme";

const Lander = ({ navigation }: { navigation: any }) => {
    return (
        <Center>
            <View style={styles.content}>
                <Text style={styles.header}>Welcome to Nok</Text>

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
    header: {
        fontSize: Theme.fontSizes.large,
        paddingBottom: 25,
        textAlign: 'center',
        color: Theme.colors.white
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