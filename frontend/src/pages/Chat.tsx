import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../Theme'
import { API_ENDPOINT } from '../EnvironmentVariables'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

interface MessageThread {
    id: number;
    username: string;
    msg_preview: string;
}

export default function Chat({ navigation }: { navigation: any }) {

    const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            SecureStore.getItemAsync('firebase_idToken')
                .then((idToken) => {
                    if (idToken === null) {
                        // Firebase hasn't gotten a chance to update the token yet, so we'll wait a few seconds and then load threads
                        setTimeout(() => {
                            loadThreads();
                        }, 3000)
                    }
                    else {
                        // Token alredy set, go ahead and instantly load threads
                        loadThreads();
                    }
                })
        }, [])
    );

    const loadThreads = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<MessageThread[]>(`${API_ENDPOINT}/get-message-threads`, {
                    idToken
                })
                    .then((res) => {
                        setMessageThreads(res.data);
                    })
                    .catch((err) => { })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={[Theme.header, { paddingHorizontal: 15, paddingVertical: 10 }]}>Chat</Text>

            {
                messageThreads.length > 0 &&
                messageThreads.map((thread, index) => (
                    <Pressable onPress={() => { navigation.navigate('Conversation', { thread_id: thread.id, username: thread.username }) }} style={[index === messageThreads.length - 1 ? { borderBottomWidth: 0.5 } : { borderBottomWidth: 0 }, styles.thread]} key={thread.id}>
                        <Text style={styles.threadUser}>{thread.username}</Text>
                        <Text style={styles.threadMsg}>{thread.msg_preview}</Text>
                    </Pressable>
                ))
            }
            {
                messageThreads.length === 0 &&
                <View>
                    <Text style={styles.noContacts}>You do not have any contacts.</Text>
                    <Pressable onPress={() => { navigation.navigate('AddContact') }} style={styles.addContact}>
                        <Text style={styles.btnText}>Add Contact</Text>
                    </Pressable>
                </View>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white
    },
    noContacts: {
        paddingHorizontal: 15
    },
    thread: {
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.lightgrey,
        borderBottomColor: Theme.colors.lightgrey,
        paddingVertical: 5,
        paddingHorizontal: 15
    },
    threadUser: {
        fontWeight: 'bold',
        paddingBottom: 5
    },
    threadMsg: {
        color: Theme.colors.grey
    },
    addContact: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 25,
        marginVertical: 10,
        marginHorizontal: 15
    },
    btnText: {
        color: Theme.colors.white,
        textAlign: 'center'
    },
});