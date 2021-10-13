// This file is meant to be the main screen the user sees after they have logged in

import React from "react";
import { Text, View } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

const Main = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={MainScreen} />
        </Tab.Navigator>
    );
}

const MainScreen = () => {
    return (
        <Text>Main component</Text>
    );
}

export default Main;