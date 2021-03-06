import React, { useState, useContext } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, Pressable, View, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../components/Theme'
import Ionicons from '@expo/vector-icons/Ionicons';
import { socket } from '../components/Socket'
import { AuthContext } from '../contexts/AuthContext'

interface MessageThread {
    id: number;
    username: string;
    msg_preview: string;
    is_read: boolean;
}

export default function Chat({ navigation }: { navigation: any }) {

    const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);

    const { firebaseIdToken } = useContext(AuthContext);

    useFocusEffect(
        React.useCallback(() => {
            loadThreads();

            socket.on('client-new-message-threads', () => {
                loadThreads();
            })

            socket.on('return-message-threads', (data: MessageThread[]) => {
                setMessageThreads(data);
            })

            // Cleanup
            return (() => {
                socket.off('client-new-message-threads')
                socket.off('return-message-threads')
            })
        }, [])
    );

    const loadThreads = () => {
        socket.emit('get-message-threads', {
            idToken: firebaseIdToken
        })
    }

    return (
        <SafeAreaView style={styles.content}>
            <ScrollView>
                <View style={styles.topBar}>
                    <Text style={Theme.header}>Chat</Text>
                    <Image style={styles.logo} source={{ uri: Theme.logoUrl }}></Image>
                </View>

                {
                    messageThreads.length > 0 &&
                    messageThreads.map((thread, index) => (
                        <Pressable
                            onPress={() => { navigation.navigate('Conversation', { thread_id: thread.id, username: thread.username }) }}
                            style={[index === messageThreads.length - 1 ? { borderBottomWidth: 0.5 } : { borderBottomWidth: 0 }, styles.thread, { backgroundColor: (thread.is_read) ? Theme.colors.white : Theme.colors.white }]}
                            key={thread.id}
                        >
                            <Ionicons name={'ellipse'} size={12} style={{ color: Theme.colors.mediumblue, flex: 1, display: (thread.is_read) ? 'none' : 'flex' }} />
                            <View style={{ flex: 7 }}>
                                <Text style={styles.threadUser}>{thread.username}</Text>
                                <Text style={styles.threadMsg}>{thread.msg_preview}</Text>
                            </View>
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
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15
    },
    logo: {
        width: 55,
        height: 25,
        margin: 15
    },
    noContacts: {
        paddingHorizontal: 15
    },
    thread: {
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.lightgrey,
        borderBottomColor: Theme.colors.lightgrey,
        paddingVertical: 5,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
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