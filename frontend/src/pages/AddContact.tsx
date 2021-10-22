import React, { useState } from 'react'
import { Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../components/Theme';
import * as SecureStore from 'expo-secure-store'
import axios from 'axios';
import { API_ENDPOINT } from '../components/EnvironmentVariables';

interface addContactResults {
    error: boolean,
    message: string
}

export default function AddContact({ navigation }: { navigation: any }) {

    const [contactUsername, setContactUsername] = useState('');

    const handleAdd = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<addContactResults>(`${API_ENDPOINT}/add-contact`, {
                    idToken,
                    username: contactUsername
                })
                    .then((results) => {
                        if (results.data.error) {
                            alert(results.data.message);
                        }
                        else {
                            navigation.navigate('Contacts');
                        }
                    })
                    .catch((err) => {

                    })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={styles.header}>Add Contact</Text>

            <TextInput autoCapitalize={'none'} onChangeText={(text) => { setContactUsername(text) }} style={styles.input} placeholder="Enter username" />

            <Pressable onPress={handleAdd} style={styles.addContact}>
                <Text style={styles.btnText}>Add Contact +</Text>
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
    header: {
        fontSize: Theme.fontSizes.medium,
        paddingBottom: 10
    },
    input: {
        backgroundColor: '#f5f5f5',
        fontSize: Theme.fontSizes.normal,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 25
    },
    addContact: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 25,
        marginVertical: 10
    },
    btnText: {
        color: Theme.colors.white,
        textAlign: 'center'
    }
});