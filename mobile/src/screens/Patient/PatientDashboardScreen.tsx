import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Appointment } from '../../types';
import { format } from 'date-fns';

export default function PatientDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(`/appointments?patient=${user?.id}&status=Scheduled,Confirmed&limit=5`);
      setUpcomingAppointments(response.data.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return '#4CAF50';
      case 'Scheduled':
        return '#2196F3';
      case 'Completed':
        return '#8BC34A';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.greeting}>
          Welcome, {user?.firstName}!
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Quick Actions
            </Text>
            <View style={styles.actions}>
              <Button
                mode="contained"
                icon="calendar-plus"
                onPress={() => navigation.navigate('BookAppointment')}
                style={styles.actionButton}
              >
                Book Appointment
              </Button>
              <Button
                mode="outlined"
                icon="file-document"
                onPress={() => navigation.navigate('MedicalRecords')}
                style={styles.actionButton}
              >
                Medical Records
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Upcoming Appointments
            </Text>
            {upcomingAppointments.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No upcoming appointments
              </Text>
            ) : (
              upcomingAppointments.map((apt) => {
                const doctor = typeof apt.doctor === 'object' ? apt.doctor : null;
                const date = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
                return (
                  <Surface key={apt.id || apt._id} style={styles.appointmentItem}>
                    <View style={styles.appointmentHeader}>
                      <Text variant="titleSmall">
                        Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                      </Text>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(apt.status) }]}
                        textStyle={styles.statusText}
                      >
                        {apt.status}
                      </Chip>
                    </View>
                    <Text variant="bodySmall" style={styles.appointmentDate}>
                      {date ? format(date, 'MMM dd, yyyy') : 'N/A'} at {apt.appointmentTime}
                    </Text>
                    {apt.reason && (
                      <Text variant="bodySmall" style={styles.appointmentReason}>
                        Reason: {apt.reason}
                      </Text>
                    )}
                  </Surface>
                );
              })
            )}
            {upcomingAppointments.length > 0 && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('Appointments')}
                style={styles.viewAllButton}
              >
                View All Appointments
              </Button>
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  greeting: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  appointmentItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentDate: {
    color: '#666',
    marginBottom: 4,
  },
  appointmentReason: {
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 16,
  },
  viewAllButton: {
    marginTop: 8,
  },
});

