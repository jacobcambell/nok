import React from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";

const Lander = () => {
    return (
        <View style={styles.content}>
            <Text>Welcome to Nok</Text>
            <Pressable>
                <Text>Sign Up</Text>
            </Pressable>
            <Pressable>
                <Text>Log In</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Lander;