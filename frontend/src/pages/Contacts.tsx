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
}
interface allContacts {
    active_contacts: Contact[];
    outgoing_contacts: Contact[];
    incoming_contacts: Contact[];
}

export default function Contacts({ navigation }: { navigation: any }) {

    const handleAdd = () => {
        navigation.navigate('AddContact');
    }

    const [contacts, setContacts] = useState<allContacts>({
        active_contacts: [],
        outgoing_contacts: [],
        incoming_contacts: []
    });

    useFocusEffect(
        React.useCallback(() => {
            loadContacts();
        }, [])
    );

    const loadContacts = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<allContacts>(`${API_ENDPOINT}/get-contacts`, {
                    idToken
                })
                    .then((results) => {
                        setContacts(results.data);
                        console.log(results.data)
                    })
                    .catch((err) => {
                        alert(err);
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
                // Incoming Contact Requests
                contacts.incoming_contacts.length > 0 &&
                <Text style={styles.label}>Incoming Requests {contacts.incoming_contacts.length}</Text>
            }
            {
                contacts.incoming_contacts.length > 0 &&
                contacts.incoming_contacts.map((contact) => (
                    <Pressable style={styles.contact} key={Date.now() + contact.username}>
                        <Text style={styles.contactName}>{contact.username}</Text>
                    </Pressable>
                ))
            }

            {
                // Outgoing Contact Requests
                contacts.outgoing_contacts.length > 0 &&
                <Text style={styles.label}>Outgoing Requests {contacts.outgoing_contacts.length}</Text>
            }
            {
                contacts.outgoing_contacts.length > 0 &&
                contacts.outgoing_contacts.map((contact) => (
                    <Pressable style={styles.contact} key={Date.now() + contact.username}>
                        <Text style={styles.contactName}>{contact.username}</Text>
                    </Pressable>
                ))
            }

            {
                // All Non-Pending Contact Requests
                contacts.active_contacts.length > 0 &&
                <Text style={styles.label}>Active Contacts {contacts.active_contacts.length}</Text>
            }
            {
                contacts.active_contacts.length > 0 &&
                contacts.active_contacts.map((contact) => (
                    <Pressable style={styles.contact} key={Date.now() + contact.username}>
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
    label: {
        fontWeight: 'bold'
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