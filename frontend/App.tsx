import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lander from './src/Lander';
import Main from './src/Main';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Lander" component={Lander} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;