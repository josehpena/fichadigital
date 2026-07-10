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
import SwipeTabs           from './src/components/SwipeTabs';
import CustomizationModal  from './src/components/CustomizationModal';
import RaceSelectionModal  from './src/components/RaceSelectionModal';
import JournalModal        from './src/components/JournalModal';
import AdventuresScreen    from './src/screens/AdventuresScreen';
import SheetSelectScreen   from './src/screens/SheetSelectScreen';
import AuthScreen          from './src/screens/AuthScreen';
import { loadSheetsList }  from './src/utils/sheetsManager';
import { fullSync, startNetworkListener, stopNetworkListener } from './src/services/syncService';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Personagem:  '📜',
  Equipamento: '🛡️',
  Habilidades: '🌟',
  Turno:       '⚔️',
};

// ─── Seções agrupadas (subseções navegáveis por swipe) ───────────────────────

const CHARACTER_PAGES = [
  { key: 'status',    title: 'Status',    icon: '❤️', component: HomeScreen },
  { key: 'atributos', title: 'Atributos', icon: '💪', component: AttributesScreen },
  { key: 'pericias',  title: 'Perícias',  icon: '📖', component: SkillsScreen },
];

const GEAR_PAGES = [
  { key: 'equip',      title: 'Equipamento', icon: '🛡️', component: EquipmentScreen },
  { key: 'inventario', title: 'Inventário',  icon: '🎒', component: InventoryScreen },
];

const ABILITY_PAGES = [
  { key: 'habilidades', title: 'Habilidades', icon: '🌟', component: SkillTreeScreen },
  { key: 'titulos',     title: 'Títulos',     icon: '👑', component: TitlesScreen },
];

function CharacterSection() { return <SwipeTabs pages={CHARACTER_PAGES} />; }
function GearSection()      { return <SwipeTabs pages={GEAR_PAGES} />; }
function AbilitySection()   { return <SwipeTabs pages={ABILITY_PAGES} />; }

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [showCustom, setShowCustom]         = useState(false);
  const [showJournal, setShowJournal]       = useState(false);
  const [showAdventures, setShowAdventures] = useState(false);
  const [showRaceSelect, setShowRaceSelect] = useState(false);
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
    setShowRaceSelect(true);
  }

  function handleCloseRaceSelect() {
    setShowRaceSelect(false);
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
                  onPress={() => setShowAdventures(true)}
                  style={{ padding: 6 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ fontSize: 20 }}>{'\u{1F5FA}\uFE0F'}</Text>
                </TouchableOpacity>
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
          <Tab.Screen name="Personagem"  component={CharacterSection}    options={{ tabBarLabel: 'Personagem' }} />
          <Tab.Screen name="Equipamento" component={GearSection}         options={{ tabBarLabel: 'Equipamento' }} />
          <Tab.Screen name="Habilidades" component={AbilitySection}      options={{ tabBarLabel: 'Habilidades' }} />
          <Tab.Screen name="Turno"       component={TurnAssistantScreen} options={{ title: 'Assistente de Turno', tabBarLabel: 'Turno' }} />
        </Tab.Navigator>

        <AdventuresScreen
          visible={showAdventures}
          onClose={() => setShowAdventures(false)}
          userId={user.id}
          sheetId={selectedSheet.id}
          sheetName={selectedSheet.name}
        />
        <JournalModal visible={showJournal} onClose={() => setShowJournal(false)} />
        <RaceSelectionModal
          visible={showRaceSelect}
          onClose={handleCloseRaceSelect}
        />
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
