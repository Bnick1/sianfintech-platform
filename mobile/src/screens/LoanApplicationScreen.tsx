import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loanService, aiService } from '../services/api';

const LoanApplicationScreen = () => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    termMonths: '6',
    purpose: 'business_expansion',
    occupation: '',
  });
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAIAssessment = async () => {
    if (!formData.occupation || !formData.amount) {
      Alert.alert('Error', 'Please fill occupation and amount first');
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.predict({
        occupation: formData.occupation,
        monthlyVolume: parseInt(formData.amount) * 3
      });
      setAiResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'AI Assessment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.userId || !formData.amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await loanService.apply({
        userId: formData.userId,
        amount: parseInt(formData.amount),
        termMonths: parseInt(formData.termMonths),
        purpose: formData.purpose
      });
      Alert.alert('Success', 'Loan application submitted!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apply for Loan</Text>
        <Text style={styles.subtitle}>AI-powered loan assessment</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>User ID *</Text>
        <TextInput
          style={styles.input}
          value={formData.userId}
          onChangeText={(text) => setFormData(prev => ({...prev, userId: text}))}
          placeholder="Paste User ID from registration"
        />

        <Text style={styles.label}>Loan Amount (UGX) *</Text>
        <TextInput
          style={styles.input}
          value={formData.amount}
          onChangeText={(text) => setFormData(prev => ({...prev, amount: text}))}
          placeholder="500000"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Occupation *</Text>
        <TextInput
          style={styles.input}
          value={formData.occupation}
          onChangeText={(text) => setFormData(prev => ({...prev, occupation: text}))}
          placeholder="market_vendor, tailor, etc."
        />

        <Text style={styles.label}>Loan Term (Months)</Text>
        <View style={styles.termButtons}>
          {['3', '6', '12'].map((term) => (
            <TouchableOpacity
              key={term}
              style={[
                styles.termButton,
                formData.termMonths === term && styles.termButtonSelected
              ]}
              onPress={() => setFormData(prev => ({...prev, termMonths: term}))}
            >
              <Text style={[
                styles.termButtonText,
                formData.termMonths === term && styles.termButtonTextSelected
              ]}>
                {term} months
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {aiResult && (
          <View style={styles.aiResult}>
            <Text style={styles.aiTitle}>AI Assessment</Text>
            <View style={styles.aiStats}>
              <View style={styles.aiStat}>
                <Text style={styles.aiStatValue}>{aiResult.prediction.riskScore}%</Text>
                <Text style={styles.aiStatLabel}>Risk Score</Text>
              </View>
              <View style={styles.aiStat}>
                <Text style={styles.aiStatValue}>
                  {aiResult.prediction.recommendation.replace('_', ' ')}
                </Text>
                <Text style={styles.aiStatLabel}>Recommendation</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.aiButton, loading && styles.buttonDisabled]}
          onPress={handleAIAssessment}
          disabled={loading}
        >
          <Text style={styles.aiButtonText}>
            {loading ? 'Assessing...' : '🤖 AI Assessment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Apply for Loan'}
          </Text>
        </TouchableOpacity>
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
  termButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  termButtonSelected: {
    borderColor: '#0c8cef',
    backgroundColor: '#f0f7ff',
  },
  termButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  termButtonTextSelected: {
    color: '#0c8cef',
    fontWeight: '600',
  },
  aiResult: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bae0fd',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c8cef',
    marginBottom: 12,
  },
  aiStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiStat: {
    alignItems: 'center',
  },
  aiStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  aiButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#0c8cef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoanApplicationScreen;