import React, { useState, useEffect } from 'react'
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINT } from '../EnvironmentVariables';
import { useFocusEffect } from '@react-navigation/core';
import axios from 'axios';

interface Contact {
    id: number;
    username: string;
}
interface allContacts {
    active_contacts: Contact[];
    outgoing_contacts: Contact[];
    incoming_contacts: Contact[];
}

export default function Contacts({ navigation }: { navigation: any }) {

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

    const handleAdd = () => {
        navigation.navigate('AddContact');
    }

    const processContact = (contact_id: number, command: string) => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<any>(`${API_ENDPOINT}/process-contact`, {
                    contact_id,
                    command,
                    idToken
                })
                    .then(() => {
                        loadContacts();
                    })
                    .catch((err) => { })
            })
    }

    const loadContacts = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<allContacts>(`${API_ENDPOINT}/get-contacts`, {
                    idToken
                })
                    .then((results) => {
                        setContacts(results.data);
                    })
                    .catch((err) => {
                        alert(err);
                    })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={Theme.header}>Contacts</Text>

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
                    <Pressable style={styles.contact} key={contact.id}>
                        <Text style={styles.contactName}>{contact.username}</Text>
                        <View style={styles.btnContainer}>
                            <Pressable style={styles.btnAccept} onPress={() => { processContact(contact.id, 'accept') }}>
                                <Text style={styles.btnText}>Accept</Text>
                            </Pressable>
                            <Pressable style={styles.btnDeny} onPress={() => { processContact(contact.id, 'deny') }}>
                                <Text style={styles.btnText}>Deny</Text>
                            </Pressable>
                        </View>
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
                    <Pressable style={styles.contact} key={contact.id}>
                        <Text style={styles.contactName}>{contact.username}</Text>
                        <View style={styles.btnContainer}>
                            <Pressable style={styles.btnCancel} onPress={() => { processContact(contact.id, 'cancel') }}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </Pressable>
                        </View>
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
                    <Pressable style={styles.contact} key={contact.id}>
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
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10
    },
    contact: {
        borderTopWidth: 0.25,
        borderBottomWidth: 0.25,
        paddingVertical: 10,
        borderTopColor: Theme.colors.lightgrey,
        borderBottomColor: Theme.colors.lightgrey,
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    contactName: {
        fontSize: Theme.fontSizes.normal
    },
    btnContainer: {
        flexDirection: 'row'
    },
    btnAccept: {
        backgroundColor: Theme.colors.success,
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginRight: 10
    },
    btnDeny: {
        backgroundColor: Theme.colors.red,
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 15
    },
    btnCancel: {
        backgroundColor: Theme.colors.grey,
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 15
    }
});