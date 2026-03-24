import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';

import { CharacterProvider } from './src/context/CharacterContext';
import HomeScreen          from './src/screens/HomeScreen';
import AttributesScreen    from './src/screens/AttributesScreen';
import SkillsScreen        from './src/screens/SkillsScreen';
import EquipmentScreen     from './src/screens/EquipmentScreen';
import SkillTreeScreen     from './src/screens/SkillTreeScreen';
import TitlesScreen        from './src/screens/TitlesScreen';
import InventoryScreen     from './src/screens/InventoryScreen';
import TurnAssistantScreen from './src/screens/TurnAssistantScreen';
import CustomizationModal  from './src/components/CustomizationModal';
import SheetSelectScreen   from './src/screens/SheetSelectScreen';
import { loadSheetsList }  from './src/utils/sheetsManager';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Status:      '❤️',
  Atributos:   '⚔️',
  Perícias:    '📖',
  Equip:       '🛡️',
  Habilidades: '🌟',
  Títulos:     '👑',
  Inventário:  '🎒',
  Turno:       '⚔️',
};

export default function App() {
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null); // { id, name, createdAt }
  const [showCustom, setShowCustom]       = useState(false);
  const [isFirstSetup, setIsFirstSetup]   = useState(false);

  // Carrega lista de fichas na inicialização
  useEffect(() => {
    loadSheetsList().then(list => {
      setSheetsLoading(false);
      // Se só há uma ficha e foi migrada, seleciona automaticamente
      // (comportamento anterior mantido)
    });
  }, []);

  function handleSelectSheet(sheet) {
    setIsFirstSetup(false);
    setSelectedSheet(sheet);
  }

  function handleNewSheet(sheet) {
    setIsFirstSetup(true);
    setSelectedSheet(sheet);
    setShowCustom(true); // Abre personalização automaticamente para nova ficha
  }

  function handleCloseCustom() {
    setShowCustom(false);
    setIsFirstSetup(false);
  }

  // Tela de carregamento
  if (sheetsLoading) {
    return (
      <View style={appStyles.loading}>
        <Text style={appStyles.loadingTitle}>Ficha Digital</Text>
        <ActivityIndicator color="#89b4fa" style={{ marginTop: 16 }} />
      </View>
    );
  }

  // Tela de seleção de fichas
  if (!selectedSheet) {
    return (
      <>
        <StatusBar style="light" />
        <SheetSelectScreen onSelect={handleSelectSheet} onNew={handleNewSheet} />
      </>
    );
  }

  // Tela principal — CharacterProvider usa key para resetar estado ao trocar ficha
  return (
    <CharacterProvider key={selectedSheet.id} sheetId={selectedSheet.id}>
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
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => setSelectedSheet(null)}
                style={{ marginLeft: 14, padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 18 }}>📋</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setShowCustom(true)}
                style={{ marginRight: 16, padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </TouchableOpacity>
            ),
            headerTitle: () => (
              <Text style={{ color: '#cdd6f4', fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>
                {selectedSheet.name}
              </Text>
            ),
          })}
        >
          <Tab.Screen name="Status"      component={HomeScreen}          options={{ tabBarLabel: 'Status' }} />
          <Tab.Screen name="Atributos"   component={AttributesScreen}    options={{ title: 'Atributos' }} />
          <Tab.Screen name="Perícias"    component={SkillsScreen}        options={{ title: 'Perícias' }} />
          <Tab.Screen name="Equip"       component={EquipmentScreen}     options={{ title: 'Equipamento', tabBarLabel: 'Equip' }} />
          <Tab.Screen name="Habilidades" component={SkillTreeScreen}     options={{ title: 'Habilidades' }} />
          <Tab.Screen name="Títulos"     component={TitlesScreen}        options={{ title: 'Títulos' }} />
          <Tab.Screen name="Inventário"  component={InventoryScreen}     options={{ title: 'Inventário' }} />
          <Tab.Screen name="Turno"       component={TurnAssistantScreen} options={{ title: 'Assistente de Turno' }} />
        </Tab.Navigator>

        <CustomizationModal
          visible={showCustom}
          onClose={handleCloseCustom}
          isFirstSetup={isFirstSetup}
        />
      </NavigationContainer>
    </CharacterProvider>
  );
}

const appStyles = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: '#11111b',
    alignItems: 'center', justifyContent: 'center',
  },
  loadingTitle: {
    color: '#cdd6f4', fontSize: 28, fontWeight: '800', letterSpacing: 1,
  },
});
