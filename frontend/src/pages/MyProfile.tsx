import React, { useContext, useState } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { Theme } from '../Theme';
import { signOut } from '@firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/core';
import axios from 'axios';
import { API_ENDPOINT } from '../EnvironmentVariables';

interface getUsernameFields {
    error: boolean,
    username: string
}

export default function MyProfile({ navigation }: { navigation: any }) {

    const { firebaseAuth } = useContext(AuthContext);
    const [myUsername, setMyUsername] = useState('');

    const handleLogout = () => {
        signOut(firebaseAuth).then(() => {
            // Remove user from SecureStore
            SecureStore.deleteItemAsync('firebase_idToken')
                .then(() => {
                    navigation.navigate('Lander');
                })
        }).catch((error) => {
            alert('Could not sign out');
        });
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchUsername();
        }, [])
    );

    const fetchUsername = () => {
        SecureStore.getItemAsync('firebase_idToken')
            .then((idToken) => {
                axios.post<getUsernameFields>(`${API_ENDPOINT}/get-my-username`, {
                    idToken
                })
                    .then((results) => {
                        setMyUsername(results.data.username);
                    })
                    .catch(() => {
                        alert('Could not get username from server');
                    })
            })
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={Theme.header}>My Profile</Text>

            <Pressable style={styles.row}>
                <Text style={styles.label}>Username</Text>
                <Text style={styles.username}>@{myUsername}</Text>
            </Pressable>

            <Pressable onPress={handleLogout} style={styles.btn}>
                <Text style={styles.logout}>Log Out</Text>
            </Pressable>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.white,
        padding: 15
    },
    row: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: Theme.colors.lightgrey,
        paddingVertical: 5
    },
    label: {
        fontWeight: 'bold'
    },
    username: {
        color: Theme.colors.mediumblue,
        fontSize: Theme.fontSizes.normal,
        fontWeight: 'bold'
    },
    btn: {
        marginVertical: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: Theme.colors.red,
    },
    logout: {
        fontSize: Theme.fontSizes.small,
        color: Theme.colors.red,
        textAlign: 'center'
    }
});