import React from 'react'
import { SafeAreaView, Text } from 'react-native';

const Loading = () => {
    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Trying to connect...</Text>
        </SafeAreaView>
    );
}

export default Loading;