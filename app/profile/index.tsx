import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { RoleBadge } from '@/components/Badge';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { updateCurrentUserProfile } from '@/services/profileService';

export default function ProfileScreen() {
  const { user, profile, role, signOut, refreshProfile, updatePassword } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Member';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage('');

    const res = await updateCurrentUserProfile({
      full_name: fullName.trim(),
    });
    setIsSaving(false);

    if (res.success) {
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile details updated successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setIsPasswordUpdating(true);
    const { error } = await updatePassword(newPassword);
    setIsPasswordUpdating(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Your password has been changed successfully.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your QMS account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Profile Header Card */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>

        <View style={styles.badgeRow}>
          <RoleBadge role={role} />
        </View>

        <Text style={styles.memberSinceText}>Member since {memberSince}</Text>
      </Card>

      {/* Editable Profile Information */}
      <Card style={styles.cardSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                setFullName(profile?.full_name || '');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={user?.email || ''}
              editable={false}
              helper="Email address cannot be changed from mobile profile"
            />
            <View style={styles.roleReadOnlyBox}>
              <Text style={styles.readOnlyLabel}>Account Role</Text>
              <Text style={styles.readOnlyValue}>{role || 'MEMBER'} (Server Managed)</Text>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={isSaving}
              size="md"
              style={styles.saveBtn}
            />
          </View>
        ) : (
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{displayName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned Role</Text>
              <Text style={styles.detailValue}>{role || 'MEMBER'}</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Security & Password */}
      <Card style={styles.cardSection}>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
          activeOpacity={0.7}
        >
          <View style={styles.toggleLeft}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primaryLight} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>
          <Ionicons
            name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.text.muted}
          />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={styles.passwordForm}>
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
            />
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />
            <Button
              title="Update Password"
              onPress={handleUpdatePassword}
              loading={isPasswordUpdating}
              variant="primary"
              size="md"
            />
          </View>
        )}
      </Card>

      {/* Security Storage Info */}
      <Card style={styles.cardSection}>
        <View style={styles.securityHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.emeraldLight} />
          <Text style={styles.securityTitle}>Secure Mobile Environment</Text>
        </View>
        <Text style={styles.securityText}>
          Authentication sessions are encrypted and stored via Expo SecureStore. No passwords or server secrets are stored locally.
        </Text>
      </Card>

      {/* Sign Out Button */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="destructive"
        size="lg"
        icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
        style={styles.logoutBtn}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primaryLight,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  badgeRow: {
    marginBottom: 8,
  },
  memberSinceText: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  cardSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  cancelText: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editForm: {
    gap: 4,
  },
  roleReadOnlyBox: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  readOnlyLabel: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  readOnlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  saveBtn: {
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordForm: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.emeraldLight,
  },
  securityText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  logoutBtn: {
    marginTop: 8,
  },
});
