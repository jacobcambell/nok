import React, { useContext, useState } from 'react'
import { Text, StyleSheet, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../components/Theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { socket } from '../components/Socket';
import { useFocusEffect } from '@react-navigation/core';
import { AuthContext } from '../contexts/AuthContext';

interface addContactResults {
    error: boolean,
    message: string
}

export default function AddContact({ navigation }: { navigation: any }) {

    const { firebaseIdToken } = useContext(AuthContext);
    const [contactUsername, setContactUsername] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            socket.on('add-contact-error', (data) => {
                alert(data.message);
            })

            socket.on('add-contact-success', () => {
                navigation.navigate('Contacts');
            })

            // Cleanup
            return (() => {
                socket.off('add-contact-error')
                socket.off('add-contact-success')
            })
        }, [])
    );
    const handleAdd = () => {
        socket.emit('add-contact', {
            idToken: firebaseIdToken,
            username: contactUsername
        })
    }

    const goBack = () => {
        navigation.navigate('Contacts');
    }

    return (
        <SafeAreaView style={styles.content}>
            <View style={styles.topBar}>
                <Ionicons name={'chevron-back-outline'} onPress={goBack} style={{ marginRight: 15 }} size={25} />
                <Text style={Theme.header}>Add Contact</Text>
            </View>

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
    pageName: {
        fontSize: Theme.fontSizes.normal,
        color: Theme.colors.black
    },
    input: {
        backgroundColor: '#f5f5f5',
        fontSize: Theme.fontSizes.normal,
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 25,
        marginVertical: 15,
        marginHorizontal: 15
    },
    addContact: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 25,
        marginHorizontal: 15
    },
    btnText: {
        color: Theme.colors.white,
        textAlign: 'center'
    }
});