import React, { useEffect, useContext } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme } from "./Theme";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import MyProfile from "./pages/MyProfile";
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { API_ENDPOINT } from './EnvironmentVariables';
import { AuthContext } from "./contexts/AuthContext";

const Main = () => {

    const Tab = createBottomTabNavigator();
    const { firebaseAuth } = useContext(AuthContext);

    useEffect(() => {
        // Every time the logged in user renders this main component, we want to send
        // a ping to the server with the user object
        firebaseAuth.currentUser.getIdToken(true)
            .then((idToken: any) => {
                axios.post(`${API_ENDPOINT}/ping`, {
                    idToken
                })
            })
    }, []);

    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarActiveTintColor: Theme.colors.lightblue,
            tabBarInactiveTintColor: Theme.colors.grey,
            tabBarIcon: ({ focused, color, size }) => {
                switch (route.name) {
                    case 'Chat':
                        return <Ionicons name={'chatbubble'} size={size} color={color} />;
                    case 'Contacts':
                        return <Ionicons name={'people'} size={size} color={color} />;
                    case 'MyProfile':
                        return <Ionicons name={'person-circle'} size={size} color={color} />;
                }
            },
            tabBarShowLabel: false,
            headerShown: false
        })}>
            <Tab.Screen name="Chat" component={Chat} />
            <Tab.Screen name="Contacts" component={Contacts} />
            <Tab.Screen name="MyProfile" component={MyProfile} />
        </Tab.Navigator>
    );
}

export default Main;