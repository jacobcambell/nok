import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Theme } from './Theme';

const Center = ({ children }: { children: any }) => {
    return (
        <View style={styles.center}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.darkblue
    }
});

export default Center;