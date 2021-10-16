import React, { useState } from 'react'
import { Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../Theme';
import * as SecureStore from 'expo-secure-store'
import axios from 'axios';
import { API_ENDPOINT } from '../EnvironmentVariables';

interface addContactResults {
    error: boolean,
    message: string
}

export default function ChangeUsername({ navigation }: { navigation: any }) {

    return (
        <SafeAreaView style={styles.content}>
            <Text style={Theme.header}>Change Username</Text>
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