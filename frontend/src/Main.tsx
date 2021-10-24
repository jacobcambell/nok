import React, { useEffect, useContext } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme } from "./components/Theme";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import MyProfile from "./pages/MyProfile";
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { API_ENDPOINT } from './components/EnvironmentVariables';
import { AuthContext } from "./contexts/AuthContext";
import * as Notifications from 'expo-notifications'

const Main = ({ navigation }: { navigation: any }) => {

    const Tab = createBottomTabNavigator();
    const { firebaseAuth } = useContext(AuthContext);

    useEffect(() => {
    }, []);



    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarActiveTintColor: Theme.colors.mediumblue,
            tabBarInactiveTintColor: Theme.colors.grey,
            tabBarIcon: ({ focused, color, size }) => {
                switch (route.name) {
                    case 'Chat':
                        return <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={size} color={color} />;
                    case 'Contacts':
                        return <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />;
                    case 'MyProfile':
                        return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />;
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