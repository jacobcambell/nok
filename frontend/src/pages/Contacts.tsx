import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINT } from '../EnvironmentVariables';
import { useFocusEffect } from '@react-navigation/core';
import axios from 'axios';

interface Contact {
    username: string;
    pending: boolean;
}
interface getContactsResponse {
    error: boolean;
    contacts: Contact[];
}

export default function Contacts({ navigation }: { navigation: any }) {

    const handleAdd = () => {
        navigation.navigate('AddContact');
    }

    const [contacts, setContacts] = useState<Contact[] | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadContacts();
        }, [])
    );

    const loadContacts = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<getContactsResponse>(`${API_ENDPOINT}/get-contacts`, {
                    idToken
                })
                    .then((results) => {
                        setContacts(results.data.contacts);
                    })
                    .catch((err) => {
                        alert('Could not load contacts');
                    })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={styles.header}>Contacts</Text>

            <Pressable onPress={handleAdd} style={styles.addContact}>
                <Text style={styles.btnText}>Add Contact +</Text>
            </Pressable>

            {
                contacts !== null &&
                contacts.map((contact) => (
                    <Pressable style={styles.contact}>
                        <Text style={styles.contactName}>{contact.username}</Text>
                    </Pressable>
                ))
            }
        </SafeAreaView >
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
    addContact: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 25,
        marginBottom: 15
    },
    btnText: {
        color: Theme.colors.white,
        textAlign: 'center'
    },
    contact: {
        borderTopWidth: 0.25,
        borderBottomWidth: 0.25,
        paddingVertical: 10,
        borderTopColor: Theme.colors.lightgrey,
        borderBottomColor: Theme.colors.lightgrey
    },
    contactName: {
        fontSize: Theme.fontSizes.normal
    }
});