import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lander from './src/Lander';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Main from './src/Main';
import AuthProvider from './src/contexts/AuthContext';
import AddContact from './src/pages/AddContact';
import Conversation from './src/pages/Conversation';
import ChangeUsername from './src/pages/ChangeUsername';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
                    <Stack.Screen name="Lander" component={Lander} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="Main" component={Main} />

                    <Stack.Screen name="AddContact" component={AddContact} />
                    <Stack.Screen name="Conversation" component={Conversation} />
                    <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}

export default App;