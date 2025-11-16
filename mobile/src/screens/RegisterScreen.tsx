import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, AlertButton } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../services/api';
import { offlineService } from '../services/offlineService';
import NetInfo from '@react-native-community/netinfo';

interface FormData {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  idType: string;
  idNumber: string;
}

interface Occupation {
  value: string;
  label: string;
  icon: string;
}

interface IdType {
  value: string;
  label: string;
}

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    idType: 'national_id',
    idNumber: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [registeredUserId, setRegisteredUserId] = useState<string>('');

  const occupations: Occupation[] = [
    { value: 'market_vendor', label: 'Market Vendor', icon: '🛒' },
    { value: 'tailor', label: 'Tailor/Artisan', icon: '👕' },
    { value: 'boda_boda', label: 'Boda-boda', icon: '🏍️' },
    { value: 'farmer', label: 'Farmer', icon: '🌱' },
  ];

  const idTypes: IdType[] = [
    { value: 'national_id', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'other_id', label: 'Other ID' },
  ];

  // Monitor network connection
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.name || !formData.phone || !formData.occupation) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        occupation: formData.occupation,
        idType: formData.idType,
        idNumber: formData.idNumber,
        timestamp: new Date().toISOString(),
      };

      if (isOnline) {
        // Online registration
        const response = await userService.register(payload);
        setRegisteredUserId(response.data.user._id);
        setSuccess(true);
        Alert.alert(
          'Success', 
          `Client registered successfully!\nUser ID: ${response.data.user._id}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Offline registration
        await offlineService.queueOperation('REGISTER_USER', payload);
        setSuccess(true);
        Alert.alert(
          'Queued for Sync', 
          `Client data saved offline. Will sync when connection is restored.\n\nPlease ensure you go online soon to complete registration.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>{isOnline ? '✅' : '⏳'}</Text>
        <Text style={styles.successTitle}>
          {isOnline ? 'Registration Successful!' : 'Queued Offline'}
        </Text>
        <Text style={styles.successText}>
          {isOnline 
            ? 'Client has been registered' 
            : 'Client data saved offline. Will sync when connection returns.'
          }
        </Text>
        {isOnline && registeredUserId && (
          <Text style={styles.userIdText}>User ID: {registeredUserId}</Text>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Register Client</Text>
        <Text style={styles.subtitle}>Add new client to SianFinTech</Text>
        <View style={[styles.networkStatus, isOnline ? styles.online : styles.offline]}>
          <Text style={styles.networkStatusText}>
            {isOnline ? '🟢 Online' : '🔴 Offline - Working Locally'}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
          placeholder="Enter full name"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
          placeholder="email@example.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))}
          placeholder="+256700123456"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>ID Type</Text>
        <View style={styles.idTypeContainer}>
          {idTypes.map((idType) => (
            <TouchableOpacity
              key={idType.value}
              style={[
                styles.idTypeButton,
                formData.idType === idType.value && styles.idTypeSelected
              ]}
              onPress={() => setFormData(prev => ({...prev, idType: idType.value}))}
            >
              <Text style={[
                styles.idTypeText,
                formData.idType === idType.value && styles.idTypeTextSelected
              ]}>
                {idType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>ID Number</Text>
        <TextInput
          style={styles.input}
          value={formData.idNumber}
          onChangeText={(text) => setFormData(prev => ({...prev, idNumber: text}))}
          placeholder={formData.idType === 'national_id' ? '12345678' : 'Enter ID number'}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Occupation *</Text>
        <View style={styles.occupationGrid}>
          {occupations.map((occupation) => (
            <TouchableOpacity
              key={occupation.value}
              style={[
                styles.occupationButton,
                formData.occupation === occupation.value && styles.occupationSelected
              ]}
              onPress={() => setFormData(prev => ({...prev, occupation: occupation.value}))}
            >
              <Text style={styles.occupationIcon}>{occupation.icon}</Text>
              <Text style={styles.occupationText}>{occupation.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Registering...' : isOnline ? 'Register Client' : 'Save Offline'}
          </Text>
        </TouchableOpacity>

        {!isOnline && (
          <Text style={styles.offlineWarning}>
            ⚠️ You are currently offline. Data will be saved locally and synced when connection returns.
          </Text>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  networkStatus: {
    padding: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'center',
  },
  online: {
    backgroundColor: '#dcfce7',
  },
  offline: {
    backgroundColor: '#fef3c7',
  },
  networkStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  idTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  idTypeButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  idTypeSelected: {
    borderColor: '#0c8cef',
    backgroundColor: '#f0f7ff',
  },
  idTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  idTypeTextSelected: {
    color: '#0c8cef',
    fontWeight: '600',
  },
  occupationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  occupationButton: {
    width: '48%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  occupationSelected: {
    borderColor: '#0c8cef',
    backgroundColor: '#f0f7ff',
  },
  occupationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  occupationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#0c8cef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineWarning: {
    textAlign: 'center',
    color: '#d97706',
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0c8cef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;