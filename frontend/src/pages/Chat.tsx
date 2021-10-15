import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, View } from 'react-native'
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

export default function Chat() {

    const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            loadThreads();
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
            <Text style={[Theme.header, { padding: 15 }]}>Chat</Text>

            {
                messageThreads.length > 0 &&
                messageThreads.map((thread, index) => (
                    <View style={[index === messageThreads.length - 1 ? { borderBottomWidth: 0.5 } : { borderBottomWidth: 0 }, styles.thread]} key={thread.id}>
                        <Text style={styles.threadUser}>{thread.username}</Text>
                        <Text style={styles.threadMsg}>{thread.msg_preview}</Text>
                    </View>
                ))
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white
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
    }
});