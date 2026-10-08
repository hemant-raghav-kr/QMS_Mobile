import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    const { error } = await resetPassword(email.trim());
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="key-outline" size={30} color={Colors.primaryLight} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive recovery instructions
            </Text>
          </View>

          {isSubmitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="mail-open-outline" size={36} color={Colors.emeraldLight} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successText}>
                We sent a password reset link to <Text style={styles.highlight}>{email}</Text>. Please follow the link to create a new password.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                variant="primary"
                size="md"
                style={styles.backBtn}
              />
            </View>
          ) : (
            <View style={styles.formContainer}>
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={Colors.roseLight} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <Input
                label="Email Address"
                placeholder="name@quartzite.io"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Button
                title="Send Reset Instructions"
                onPress={handleReset}
                loading={isLoading}
                size="lg"
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelText}>Cancel and return</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.roseBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: Colors.roseLight,
    flex: 1,
  },
  submitBtn: {
    marginTop: 8,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  successContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  successIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  highlight: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  backBtn: {
    width: '100%',
  },
});
