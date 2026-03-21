import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';

import { CharacterProvider } from './src/context/CharacterContext';
import HomeScreen          from './src/screens/HomeScreen';
import AttributesScreen    from './src/screens/AttributesScreen';
import SkillsScreen        from './src/screens/SkillsScreen';
import EquipmentScreen     from './src/screens/EquipmentScreen';
import SkillTreeScreen    from './src/screens/SkillTreeScreen';
import TitlesScreen       from './src/screens/TitlesScreen';
import InventoryScreen    from './src/screens/InventoryScreen';
import CustomizationModal  from './src/components/CustomizationModal';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Status:      '❤️',
  Atributos:   '⚔️',
  Perícias:    '📖',
  Equip:       '🛡️',
  Habilidades: '🌟',
  Títulos:     '👑',
  Inventário:  '🎒',
};

export default function App() {
  const [showCustom, setShowCustom] = useState(false);

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
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setShowCustom(true)}
                style={{ marginRight: 16, padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </TouchableOpacity>
            ),
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
            name="Equip"
            component={EquipmentScreen}
            options={{ title: 'Equipamento', tabBarLabel: 'Equip' }}
          />
          <Tab.Screen
            name="Habilidades"
            component={SkillTreeScreen}
            options={{ title: 'Habilidades' }}
          />
          <Tab.Screen
            name="Títulos"
            component={TitlesScreen}
            options={{ title: 'Títulos' }}
          />
          <Tab.Screen
            name="Inventário"
            component={InventoryScreen}
            options={{ title: 'Inventário' }}
          />
        </Tab.Navigator>

        <CustomizationModal visible={showCustom} onClose={() => setShowCustom(false)} />
      </NavigationContainer>
    </CharacterProvider>
  );
}
