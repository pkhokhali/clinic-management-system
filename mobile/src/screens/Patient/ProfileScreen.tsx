import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation will automatically redirect to login
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Profile Information
          </Text>

          <View style={styles.infoRow}>
            <Text variant="labelMedium" style={styles.label}>
              Full Name:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.firstName} {user?.lastName}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium" style={styles.label}>
              Email:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.email}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="labelMedium" style={styles.label}>
              Phone:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.phone}
            </Text>
          </View>

          {user?.dateOfBirth && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="labelMedium" style={styles.label}>
                  Date of Birth:
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            </>
          )}

          {user?.gender && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="labelMedium" style={styles.label}>
                  Gender:
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {user.gender}
                </Text>
              </View>
            </>
          )}

          {user?.bloodGroup && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <Text variant="labelMedium" style={styles.label}>
                  Blood Group:
                </Text>
                <Text variant="bodyLarge" style={styles.value}>
                  {user.bloodGroup}
                </Text>
              </View>
            </>
          )}

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#d32f2f"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontWeight: '600',
    flex: 1,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 4,
  },
});

