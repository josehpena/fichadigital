import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
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
import JournalModal        from './src/components/JournalModal';
import SheetSelectScreen   from './src/screens/SheetSelectScreen';
import AuthScreen          from './src/screens/AuthScreen';
import { loadSheetsList }  from './src/utils/sheetsManager';
import { fullSync, startNetworkListener, stopNetworkListener } from './src/services/syncService';

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

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showCustom, setShowCustom]       = useState(false);
  const [showJournal, setShowJournal]     = useState(false);
  const [isFirstSetup, setIsFirstSetup]   = useState(false);
  const [syncing, setSyncing]             = useState(false);

  // Sync ao logar e carrega fichas
  useEffect(() => {
    if (!user) {
      setSheetsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setSyncing(true);
      try {
        await fullSync(user.id);
      } catch {
        // Offline ou erro — continua com dados locais
      }
      if (cancelled) return;
      setSyncing(false);
      await loadSheetsList();
      setSheetsLoading(false);
    })();

    // Inicia listener de reconexao
    startNetworkListener(() => user?.id);

    return () => {
      cancelled = true;
      stopNetworkListener();
    };
  }, [user]);

  function handleSelectSheet(sheet) {
    setIsFirstSetup(false);
    setSelectedSheet(sheet);
  }

  function handleNewSheet(sheet) {
    setIsFirstSetup(true);
    setSelectedSheet(sheet);
    setShowCustom(true);
  }

  function handleCloseCustom() {
    setShowCustom(false);
    setIsFirstSetup(false);
  }

  // Tela de carregamento (auth)
  if (authLoading) {
    return (
      <SafeAreaProvider>
        <View style={appStyles.loading}>
          <Text style={appStyles.loadingTitle}>Ficha Digital</Text>
          <ActivityIndicator color="#89b4fa" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Tela de login
  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  // Tela de carregamento (sync + fichas)
  if (sheetsLoading || syncing) {
    return (
      <SafeAreaProvider>
        <View style={appStyles.loading}>
          <Text style={appStyles.loadingTitle}>Ficha Digital</Text>
          <Text style={appStyles.syncText}>Sincronizando dados...</Text>
          <ActivityIndicator color="#89b4fa" style={{ marginTop: 16 }} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Tela de selecao de fichas
  if (!selectedSheet) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SheetSelectScreen
          onSelect={handleSelectSheet}
          onNew={handleNewSheet}
          userId={user.id}
          onSignOut={signOut}
        />
      </SafeAreaProvider>
    );
  }

  // Tela principal
  return (
    <SafeAreaProvider>
    <CharacterProvider
      key={selectedSheet.id}
      sheetId={selectedSheet.id}
      userId={user.id}
      sheetName={selectedSheet.name}
    >
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                <TouchableOpacity
                  onPress={() => setShowJournal(true)}
                  style={{ padding: 6 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 20 }}>{'\u{1F4D3}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowCustom(true)}
                  style={{ padding: 6 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 20 }}>{'\u270F\uFE0F'}</Text>
                </TouchableOpacity>
              </View>
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

        <JournalModal visible={showJournal} onClose={() => setShowJournal(false)} />
        <CustomizationModal
          visible={showCustom}
          onClose={handleCloseCustom}
          isFirstSetup={isFirstSetup}
        />
      </NavigationContainer>
    </CharacterProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
  syncText: {
    color: '#6c7086', fontSize: 14, marginTop: 8,
  },
});
