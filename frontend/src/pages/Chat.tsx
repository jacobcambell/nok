import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../Theme'
import { API_ENDPOINT } from '../EnvironmentVariables'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

interface MessageThread {
    id: number;
    username: string;
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
                    .catch((err) => console.log(err))
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={Theme.header}>Chat</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white,
        padding: 15
    }
});