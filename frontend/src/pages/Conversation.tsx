import React, { useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, View, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../components/Theme'
import { API_ENDPOINT } from '../components/EnvironmentVariables'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Message {
    message_id: number;
    from: string;
    message: string;
    message_age: number;
}

export default function Conversation({ navigation, route }: { navigation: any, route: any }) {

    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);

    useFocusEffect(
        React.useCallback(() => {
            // Schedule API call to get message threads every 5 seconds (also call immediately)
            loadMessages();
            const checkInterval = setInterval(() => {
                loadMessages();
            }, 5000)

            // Clear the interval when this component loses focus
            return () => clearInterval(checkInterval);
        }, [])
    );

    const goBack = () => {
        navigation.navigate('Chat');
    }

    const loadMessages = async () => {
        if (!fetching) {
            setFetching(true);

            let token: string | null = '';
            try {
                await SecureStore.getItemAsync('firebase_idToken').then((idToken) => { token = idToken })
            }
            catch (e) {

            }

            if (token !== null) {
                try {
                    await axios.post<Message[]>(`${API_ENDPOINT}/get-conversation-messages`, {
                        idToken: token,
                        thread_id: route.params.thread_id
                    }).then((res) => {
                        setMessages(res.data);
                        setFetching(false);
                    })
                }
                catch (e) {

                }

            }
        }
    }

    useEffect(() => {
        scrollViewToBottom();
    }, [messages])

    const scrollRef = React.useRef<ScrollView>();

    const scrollViewToBottom = () => {
        scrollRef.current?.scrollToEnd({ animated: false });
    }

    const sendMessage = () => {
        if (input.length <= 0 || input.length >= 999) {
            return;
        }

        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post(`${API_ENDPOINT}/send-message`, {
                    idToken,
                    thread_id: route.params.thread_id,
                    message: input
                })
                    .then(() => {
                        // Manually call loadMessages
                        loadMessages();
                        setInput('');
                    })
                    .catch((err) => { alert(err) })
            })
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.content}>
            <SafeAreaView style={styles.content}>
                <View style={styles.topBar}>
                    <Ionicons name={'chevron-back-outline'} onPress={goBack} style={{ marginRight: 15 }} size={25} />
                    <Text style={styles.username}>{route.params.username}</Text>
                </View>
                <ScrollView ref={scrollRef} onLayout={scrollViewToBottom} onContentSizeChange={scrollViewToBottom}>
                    {
                        messages.length > 0 &&
                        messages.map((message) => (
                            <View key={message.message_id} style={styles.messageRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.messageFrom}>{message.from}</Text>
                                    <Text style={styles.messageAge}>
                                        {
                                            message.message_age == 0 &&
                                            `just now`
                                        }
                                        {
                                            message.message_age >= 1 && message.message_age <= 59 &&
                                            `${message.message_age} minutes ago`
                                        }
                                        {
                                            // 1 hour
                                            message.message_age >= 60 && message.message_age <= 119 &&
                                            `${Math.floor(message.message_age / 60)} hour ago`
                                        }
                                        {
                                            // Multiple hours
                                            message.message_age >= 120 && message.message_age <= 1339 &&
                                            `${Math.floor(message.message_age / 60)} hours ago`
                                        }
                                        {
                                            // More than a day
                                            message.message_age >= 1440 &&
                                            `${Math.floor(message.message_age / 1440)} days ago`
                                        }
                                    </Text>
                                </View>

                                <Text style={styles.messageText}>{message.message}</Text>
                            </View>
                        ))
                    }
                </ScrollView>
                <View style={styles.bottomBar}>
                    <TextInput value={input} onChangeText={(text) => { setInput(text) }} placeholder='Send a message' style={styles.textField} />
                    <Pressable style={styles.sendBtn} onPress={sendMessage}>
                        <Ionicons name={'send'} size={15} style={styles.sendBtnText} />
                    </Pressable>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
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
        alignItems: 'center',
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
        fontWeight: 'bold',
        marginRight: 5
    },
    messageAge: {
        color: Theme.colors.grey,
        fontSize: Theme.fontSizes.xsmall
    },
    messageText: {
        color: Theme.colors.black
    }

});