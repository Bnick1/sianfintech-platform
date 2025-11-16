// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const quickActions = [
    { 
      title: 'Register Client', 
      icon: 'person-add' as const,
      screen: 'Register',
      color: '#0c8cef'
    },
    { 
      title: 'Apply for Loan', 
      icon: 'cash' as const,
      screen: 'LoanApplication', 
      color: '#10b981'
    },
    { 
      title: 'AI Assessment', 
      icon: 'analytics' as const,
      screen: 'LoanApplication',
      color: '#d946ef'
    },
    { 
      title: 'My Profile', 
      icon: 'person' as const,
      screen: 'Login',
      color: '#f59e0b'
    },
  ];

  const stats = [
    { label: 'Clients', value: '1,247', color: '#0c8cef' },
    { label: 'Active Loans', value: '₦856M', color: '#10b981' },
    { label: 'Investments', value: '₦1.2B', color: '#d946ef' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.title}>SianFinTech</Text>
        <Text style={styles.subtitle}>Empowering Uganda's Informal Economy</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Client Segments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Segments</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.segmentsContainer}>
            {['Market Vendors', 'Artisans', 'Transport', 'Farmers', 'Youth'].map((segment, index) => (
              <View key={index} style={styles.segmentCard}>
                <Text style={styles.segmentIcon}>
                  {['🛒', '👕', '🏍️', '🌱', '🚀'][index]}
                </Text>
                <Text style={styles.segmentText}>{segment}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0c8cef',
    textAlign: 'center',
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  segmentsContainer: {
    flexDirection: 'row',
  },
  segmentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default DashboardScreen;