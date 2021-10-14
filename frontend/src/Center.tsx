import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Theme } from './Theme';

const Center = ({ children, vertical }: { children: any, vertical?: boolean }) => {
    if (vertical === false) {
        return (
            <View style={styles.centerNoVertical}>
                {children}
            </View>
        );
    }
    else {
        return (
            <View style={styles.center}>
                {children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.white
    },
    centerNoVertical: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Theme.colors.white
    }

});

export default Center;