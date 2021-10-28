import React, { useContext, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { Theme } from '../components/Theme';
import { useFocusEffect } from '@react-navigation/core';
import { socket } from '../components/Socket';

interface getUsernameFields {
    error: boolean,
    username: string
}

export default function MyProfile({ navigation }: { navigation: any }) {

    const { firebaseIdToken, logout } = useContext(AuthContext);
    const [myUsername, setMyUsername] = useState('');

    const handleLogout = () => {
        logout();
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchUsername();

            socket.on('return-username', (data) => {
                setMyUsername(data.username)
            })

            // Cleanup
            return (() => { socket.off('return-username') })
        }, [])
    );

    const changeUsername = () => {
        navigation.navigate('ChangeUsername', { myUsername });
    }

    const fetchUsername = () => {
        socket.emit('get-my-username', {
            idToken: firebaseIdToken
        })
    }

    return (
        <SafeAreaView style={styles.content}>
            <View style={styles.topBar}>
                <Text style={Theme.header}>My Profile</Text>
                <Image style={styles.logo} source={{ uri: Theme.logoUrl }}></Image>
            </View>

            <Pressable style={styles.row}>
                <View>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.username}>@{myUsername}</Text>
                </View>
                <View>
                    <Pressable onPress={changeUsername} style={styles.btnChangeUsername}>
                        <Text style={styles.changeUsernameText}>Change</Text>
                    </Pressable>
                </View>
            </Pressable>

            <Pressable onPress={handleLogout} style={styles.btnLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15
    },
    logo: {
        width: 55,
        height: 25,
        alignSelf: 'center'
    },
    row: {
        borderTopWidth: 0.25,
        borderBottomWidth: 0.25,
        borderColor: Theme.colors.lightgrey,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    label: {
        fontWeight: 'bold'
    },
    username: {
        color: Theme.colors.mediumblue,
        fontSize: Theme.fontSizes.normal,
        fontWeight: 'bold'
    },
    btnChangeUsername: {
        backgroundColor: Theme.colors.mediumblue,
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 15
    },
    changeUsernameText: {
        color: Theme.colors.white
    },
    btnLogout: {
        marginVertical: 50,
        padding: 5,
        borderWidth: 1,
        borderColor: Theme.colors.red,
        marginHorizontal: 15
    },
    logoutText: {
        fontSize: Theme.fontSizes.small,
        color: Theme.colors.red,
        textAlign: 'center'
    }
});