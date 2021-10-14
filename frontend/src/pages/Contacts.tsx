import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../Theme';

export default function Contacts({ navigation }: { navigation: any }) {

    const handleAdd = () => {
        navigation.navigate('AddContact');
    }

    return (
        <SafeAreaView style={styles.content}>
            <Text style={styles.header}>Contacts</Text>

            <Pressable onPress={handleAdd} style={styles.addContact}>
                <Text style={styles.btnText}>Add Contact +</Text>
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
    header: {
        fontSize: Theme.fontSizes.medium,
        paddingBottom: 10
    },
    addContact: {
        backgroundColor: Theme.colors.mediumblue,
        padding: 10,
        borderRadius: 25
    },
    btnText: {
        color: Theme.colors.white,
        textAlign: 'center'
    }
});