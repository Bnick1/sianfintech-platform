// App.tsx - Complete with offline sync
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoanApplicationScreen from './src/screens/LoanApplicationScreen';
import { offlineService } from './src/services/offlineService';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  // Initialize offline sync listener
  useEffect(() => {
    offlineService.startSyncListener();
    
    // Sync any pending operations when app starts
    const syncOnStart = async () => {
      try {
        const syncResult = await offlineService.syncPendingOperations();
        if (syncResult && syncResult.successful > 0) {
          console.log(`✅ Synced ${syncResult.successful} offline operations`);
        }
      } catch (error) {
        console.error('Failed to sync on app start:', error);
      }
    };
    
    syncOnStart();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'SianFinTech',
              headerStyle: {
                backgroundColor: '#0c8cef',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'Client Registration',
              headerStyle: {
                backgroundColor: '#0c8cef',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="LoanApplication" 
            component={LoanApplicationScreen}
            options={{ 
              title: 'Apply for Loan',
              headerStyle: {
                backgroundColor: '#0c8cef',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'Sign In',
              headerStyle: {
                backgroundColor: '#0c8cef',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}