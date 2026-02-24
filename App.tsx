import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';

import { AppProvider, useApp } from './src/context/AppContext';
import { COLORS } from './src/constants/theme';
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import ReflectionScreen from './src/screens/ReflectionScreen';
import { BottomNavBar } from './src/components';

const RootApp: React.FC = () => {
  const { isLoading } = useApp();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'add_task' | 'reflection'>('home');

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {currentScreen === 'home' && (
          <HomeScreen
            onAddTask={() => setCurrentScreen('add_task')}
            onCompleteDay={() => setCurrentScreen('reflection')}
          />
        )}
        {currentScreen === 'add_task' && (
          <AddTaskScreen onBack={() => setCurrentScreen('home')} />
        )}
        {currentScreen === 'reflection' && (
          <ReflectionScreen onFinish={() => setCurrentScreen('home')} />
        )}
      </View>

      {/* Anchored Navigation Bar */}
      {(currentScreen === 'home' || currentScreen === 'reflection') && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(screen: 'home' | 'reflection') => setCurrentScreen(screen)}
        />
      )}
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="light" />
        <RootApp />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
