import React, { useState } from 'react'
import { Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store'
import axios from 'axios';
import { API_ENDPOINT } from '../EnvironmentVariables';

interface changeUsernameResults {
    error: boolean,
    message: string
}

export default function ChangeUsername({ navigation, route }: { navigation: any, route: any }) {

    const [username, setUsername] = useState('');

    const handleChange = () => {
        // Check username length
        if (username.length <= 0 || username.length > 15) {
            alert('Your username should be between 1 and 15 characters');
            return;
        }

        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<changeUsernameResults>(`${API_ENDPOINT}/change-username`, {
                    idToken,
                    username
                })
                    .then((res) => {
                        if (res.data.error) {
                            alert(res.data.message);
                        }
                        else {
                            navigation.navigate('MyProfile');
                        }
                    })
                    .catch((err) => { })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={Theme.header}>Change Username</Text>

            <Text style={styles.info}>Your username can be up to 15 characters, and should only include letters and numbers.</Text>

            <TextInput onChangeText={(text) => { setUsername(text) }} autoCapitalize={'none'} style={styles.input} placeholder='Enter new username'></TextInput>

            <Pressable onPress={handleChange} style={styles.btnChange}>
                <Text style={styles.btnChangeText}>Change Username</Text>
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white,
        padding: 15
    },
    input: {
        backgroundColor: Theme.colors.offwhite,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 25,
        fontSize: Theme.fontSizes.normal
    },
    info: {
        color: Theme.colors.grey,
        marginVertical: 10
    },
    btnChange: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 15,
        marginVertical: 10
    },
    btnChangeText: {
        color: Theme.colors.white,
        textAlign: 'center'
    }
});