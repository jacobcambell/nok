import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthProvider from './src/contexts/AuthContext';
import SocketProvider from './src/contexts/SocketContext';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <SocketProvider>
            <AuthProvider>
            </AuthProvider>
        </SocketProvider>
    );
}

export default App;