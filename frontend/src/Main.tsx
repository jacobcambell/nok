import React, { useEffect, useContext } from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme } from "./components/Theme";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import MyProfile from "./pages/MyProfile";
import * as Notifications from 'expo-notifications'
import { socket } from "./components/Socket";
import { AuthContext } from "./contexts/AuthContext";

const Main = ({ navigation }: { navigation: any }) => {

    const Tab = createBottomTabNavigator();
    const { firebaseIdToken } = useContext(AuthContext);

    useEffect(() => {
        registerForPushNotificationsAsync().then((expoPushToken) => {
            socket.emit('ping', { idToken: firebaseIdToken, expoPushToken });
        })

        // Ping regardeless of if user allowed notifications
        socket.emit('ping', { idToken: firebaseIdToken });
    }, []);

    async function registerForPushNotificationsAsync() {
        let expoPushToken;

        const existingPerms = await Notifications.getPermissionsAsync();

        if (existingPerms.status !== 'granted') {
            // User has not yet granted us notification permissions
            const { status } = await Notifications.requestPermissionsAsync();

            if (status !== 'granted') {
                // Even after requesting perms, user still did not accept
                return;
            }
        }

        // Get the expoPushToken
        expoPushToken = await Notifications.getExpoPushTokenAsync();
        expoPushToken = expoPushToken.data;

        return expoPushToken;
    }



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