import React from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import Center from '../Center';
import { Theme } from '../Theme';

const Login = () => {
    return (
        <Center>
            <View style={styles.content}>
                <Text style={styles.header}>Login</Text>

                <TextInput placeholder="Email" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>
                <TextInput secureTextEntry={true} placeholder="Password" style={styles.input} placeholderTextColor={Theme.colors.white}></TextInput>

                <Pressable style={styles.button}>
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
});

export default Login;