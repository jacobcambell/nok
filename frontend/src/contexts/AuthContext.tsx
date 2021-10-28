import React, { createContext, useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Lander from '../pages/Lander';
import Main from '../Main';
import AddContact from '../pages/AddContact';
import Conversation from '../pages/Conversation';
import ChangeUsername from '../pages/ChangeUsername';
import Login from '../pages/Login';
import Register from '../pages/Register';

const firebaseApp = initializeApp({
    apiKey: "AIzaSyAnQ4G4n0kigRIap659em1tB3HnLUiL2I8",
    authDomain: "nokapp-2be53.firebaseapp.com",
    projectId: "nokapp-2be53",
    storageBucket: "nokapp-2be53.appspot.com",
    messagingSenderId: "752835443920",
    appId: "1:752835443920:web:a910db262baf63494472d5"
});

export const AuthContext = createContext<any>(null);
const firebaseAuth = getAuth();
const Stack = createNativeStackNavigator();

export default function AuthProvider({ children }: { children: any }) {

    const [firebaseIdToken, setFirebaseIdToken] = useState<string | undefined>();

    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                // User is logged in
                // Update firebaseIdToken every time auth state changes with Firebase
                firebaseAuth.currentUser?.getIdToken(true)
                    .then(async (token) => {
                        setFirebaseIdToken(token);
                    })
            }
            else {
                // User is not logged in
                setFirebaseIdToken(undefined);
            }
        });

        // Cleanup
        return (() => {
            unsubscribe();
        })
    }, []);

    const logout = () => {
        signOut(firebaseAuth).catch((e) => {
            // Could not sign out for some reason
        })
    }

    const login = (email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            signInWithEmailAndPassword(firebaseAuth, email, password)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject();
                })
        })
    }

    const register = (email: string, password: string) => {
        return new Promise<void>((resolve, reject) => {
            createUserWithEmailAndPassword(firebaseAuth, email, password)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject();
                })
        })
    }

    return (
        <AuthContext.Provider value={{ firebaseIdToken, logout, login, register }}>
            {
                // Show a different stack navigator based on the status of the firebaseIdToken
                typeof firebaseIdToken !== 'undefined' ?
                    <NavigationContainer>
                        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
                            <Stack.Screen name="Main" component={Main} />
                            <Stack.Screen name="AddContact" component={AddContact} />
                            <Stack.Screen name="Conversation" component={Conversation} />
                            <Stack.Screen name="ChangeUsername" component={ChangeUsername} />
                        </Stack.Navigator>
                    </NavigationContainer>
                    :
                    <NavigationContainer>
                        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
                            <Stack.Screen name="Lander" component={Lander} />
                            <Stack.Screen name="Login" component={Login} />
                            <Stack.Screen name="Register" component={Register} />
                        </Stack.Navigator>
                    </NavigationContainer>
            }
        </AuthContext.Provider>
    );
}