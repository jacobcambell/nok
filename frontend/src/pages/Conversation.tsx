import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/core'
import { Text, StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Theme } from '../Theme'
import { API_ENDPOINT } from '../EnvironmentVariables'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Conversation({ navigation, route }: { navigation: any, route: any }) {

    useFocusEffect(
        React.useCallback(() => {
            console.log(route.params)
        }, [])
    );

    const goBack = () => {
        navigation.navigate('Chat');
    }

    return (
        <SafeAreaView style={styles.content}>
            <View style={styles.topBar}>
                <Ionicons name={'chevron-back-outline'} onPress={goBack} style={{ marginRight: 15 }} size={25} />
                <Text style={styles.username}>{route.params.username}</Text>
            </View>
            <ScrollView>

            </ScrollView>
            <View style={styles.bottomBar}>
                <TextInput placeholder='Send a message' style={styles.textField} />
                <Pressable style={styles.sendBtn}>
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
        backgroundColor: '#F1F1F1',
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
    }
});