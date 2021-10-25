import React, { createContext, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications'
import axios from 'axios';
import { API_ENDPOINT } from '../components/EnvironmentVariables';
import { socket } from '../components/Socket';

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

export default function AuthProvider({ children }: { children: any }) {

    useEffect(() => {
        firebaseAuth.onAuthStateChanged((user) => {
            firebaseAuth.currentUser?.getIdToken(true)
                .then(async (token) => {
                    // Save the user's idToken to SecureStore
                    SecureStore.setItemAsync('firebase_idToken', token);
                })
        });
    }, []);

    return (
        <AuthContext.Provider value={{ firebaseAuth }}>
            {children}
        </AuthContext.Provider>
    );
}