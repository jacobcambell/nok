import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../Theme'
import { API_ENDPOINT } from '../EnvironmentVariables'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Message {
    message_id: number;
    from: string;
    message: string;
}

export default function Conversation({ navigation, route }: { navigation: any, route: any }) {

    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            loadMessages();
        }, [])
    );

    const goBack = () => {
        navigation.navigate('Chat');
    }

    const loadMessages = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<Message[]>(`${API_ENDPOINT}/get-conversation-messages`, {
                    idToken,
                    thread_id: route.params.thread_id
                })
                    .then((res) => {
                        setMessages(res.data);
                    })
                    .catch((err) => { })
            })
    }

    const sendMessage = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post(`${API_ENDPOINT}/send-message`, {
                    idToken,
                    thread_id: route.params.thread_id,
                    message: input
                })
                    .then(() => {
                        loadMessages();
                    })
                    .catch((err) => { alert(err) })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <View style={styles.topBar}>
                <Ionicons name={'chevron-back-outline'} onPress={goBack} style={{ marginRight: 15 }} size={25} />
                <Text style={styles.username}>{route.params.username}</Text>
            </View>
            <ScrollView>
                {
                    messages.length > 0 &&
                    messages.map((message) => (
                        <View key={message.message_id} style={styles.messageRow}>
                            <Text style={styles.messageFrom}>{message.from}</Text>
                            <Text style={styles.messageText}>{message.message}</Text>
                        </View>
                    ))
                }
            </ScrollView>
            <View style={styles.bottomBar}>
                <TextInput onChangeText={(text) => { setInput(text) }} placeholder='Send a message' style={styles.textField} />
                <Pressable style={styles.sendBtn} onPress={sendMessage}>
                    <Ionicons name={'send'} size={15} style={styles.sendBtnText} />
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white
    },
    topBar: {
        borderBottomWidth: 0.25,
        borderBottomColor: Theme.colors.lightgrey,
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    username: {
        fontSize: Theme.fontSizes.normal,
        color: Theme.colors.black
    },
    bottomBar: {
        borderBottomWidth: 0.25,
        borderBottomColor: Theme.colors.lightgrey,
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'stretch'
    },
    textField: {
        flex: 3,
        backgroundColor: Theme.colors.offwhite,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 25,
        fontSize: Theme.fontSizes.normal,
        marginRight: 10
    },
    sendBtn: {
        backgroundColor: Theme.colors.mediumblue,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25
    },
    sendBtnText: {
        color: Theme.colors.white,
        textAlign: 'center',
        fontSize: Theme.fontSizes.medium
    },
    messageRow: {
        marginVertical: 5,
        paddingHorizontal: 15
    },
    messageFrom: {
        fontWeight: 'bold'
    },
    messageText: {
        color: Theme.colors.black
    }

});