import React from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Theme } from "./Theme";

const Lander = () => {
    return (
        <View style={styles.content}>
            <Text style={styles.header}>Welcome to Nok</Text>

            <Pressable style={[styles.button, styles.signUp]}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.login]}>
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50
    },
    header: {
        fontSize: Theme.fontSizes.large,
        paddingBottom: 25
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
    signUp: {
        backgroundColor: Theme.colors.darkblue
    },
    login: {
        backgroundColor: Theme.colors.mediumblue
    }
});

export default Lander;