import React, { useContext, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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

    const changeUsername = () => {
        navigation.navigate('ChangeUsername', { myUsername });
    }

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

            <Image style={styles.logo} source={{ uri: Theme.logoUrl }}></Image>
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
        borderTopWidth: 0.25,
        borderBottomWidth: 0.25,
        borderColor: Theme.colors.lightgrey,
        paddingVertical: 5,
        marginVertical: 15,
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
        marginVertical: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: Theme.colors.red,
    },
    logoutText: {
        fontSize: Theme.fontSizes.small,
        color: Theme.colors.red,
        textAlign: 'center'
    },
    logo: {
        width: 55,
        height: 25,
        alignSelf: 'center'
    }
});