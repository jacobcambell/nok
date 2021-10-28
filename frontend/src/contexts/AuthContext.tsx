import React, { createContext, useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import Loading from '../components/Loading';

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

    const [firebaseIdToken, setFirebaseIdToken] = useState<string | undefined>();

    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
            // Update firebaseIdToken every time auth state changes with Firebase
            firebaseAuth.currentUser?.getIdToken(true)
                .then(async (token) => {
                    setFirebaseIdToken(token);
                })
        });

        // Cleanup
        return (() => {
            unsubscribe();
        })
    }, []);

    return (
        <AuthContext.Provider value={{ firebaseIdToken }}>
            {typeof firebaseIdToken !== 'undefined' ? children : <Loading></Loading>}
        </AuthContext.Provider>
    );
}