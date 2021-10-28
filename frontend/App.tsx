import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lander from './src/pages/Lander';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Main from './src/Main';
import AuthProvider from './src/contexts/AuthContext';
import SocketProvider from './src/contexts/SocketContext';
import AddContact from './src/pages/AddContact';
import Conversation from './src/pages/Conversation';
import ChangeUsername from './src/pages/ChangeUsername';

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