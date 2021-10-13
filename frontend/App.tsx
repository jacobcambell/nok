import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lander from './src/Lander';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Main from './src/Main';

const Stack = createNativeStackNavigator();

// Firebase
import { initializeApp } from "firebase/app";
const firebaseConfig = {
    apiKey: "AIzaSyAnQ4G4n0kigRIap659em1tB3HnLUiL2I8",
    authDomain: "nokapp-2be53.firebaseapp.com",
    projectId: "nokapp-2be53",
    storageBucket: "nokapp-2be53.appspot.com",
    messagingSenderId: "752835443920",
    appId: "1:752835443920:web:b0e6a212860b2d214472d5"
};
const app = initializeApp(firebaseConfig);

import { getAuth, onAuthStateChanged } from '@firebase/auth';
import * as SecureStore from 'expo-secure-store';

const App = () => {
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            user?.getIdToken()
                .then(token => {
                    // Save Firebase JWT to local storage
                    SecureStore.setItemAsync('firebase_jwt', token);
                })
        });
    });

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
                <Stack.Screen name="Lander" component={Lander} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Main" component={Main} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;