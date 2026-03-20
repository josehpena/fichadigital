import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { CharacterProvider } from './src/context/CharacterContext';
import HomeScreen       from './src/screens/HomeScreen';
import AttributesScreen from './src/screens/AttributesScreen';
import SkillsScreen     from './src/screens/SkillsScreen';
import EquipmentScreen  from './src/screens/EquipmentScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Status:     '❤️',
  Atributos:  '⚔️',
  Perícias:   '📖',
  Equipamento:'🛡️',
};

export default function App() {
  return (
    <CharacterProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: focused ? 22 : 18 }}>
                {TAB_ICONS[route.name]}
              </Text>
            ),
            tabBarStyle: {
              backgroundColor: '#1e1e2e',
              borderTopColor: '#2e2e4e',
            },
            tabBarActiveTintColor:   '#89b4fa',
            tabBarInactiveTintColor: '#6c7086',
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            headerStyle:      { backgroundColor: '#1e1e2e' },
            headerTintColor:  '#cdd6f4',
            headerTitleStyle: { fontWeight: 'bold' },
          })}
        >
          <Tab.Screen
            name="Status"
            component={HomeScreen}
            options={{ title: 'Ficha Digital', tabBarLabel: 'Status' }}
          />
          <Tab.Screen
            name="Atributos"
            component={AttributesScreen}
            options={{ title: 'Atributos' }}
          />
          <Tab.Screen
            name="Perícias"
            component={SkillsScreen}
            options={{ title: 'Perícias' }}
          />
          <Tab.Screen
            name="Equipamento"
            component={EquipmentScreen}
            options={{ title: 'Equipamento' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </CharacterProvider>
  );
}
