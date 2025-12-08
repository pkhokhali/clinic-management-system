import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, Surface, FAB } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Appointment } from '../../types';
import { format } from 'date-fns';

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments?patient=${user?.id}&sort=-appointmentDate,-appointmentTime`);
      setAppointments(response.data.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
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
      case 'No Show':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {appointments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No appointments found
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('BookAppointment')}
                  style={styles.bookButton}
                >
                  Book Appointment
                </Button>
              </Card.Content>
            </Card>
          ) : (
            appointments.map((apt) => {
              const doctor = typeof apt.doctor === 'object' ? apt.doctor : null;
              const date = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
              return (
                <Card key={apt.id || apt._id} style={styles.card}>
                  <Card.Content>
                    <View style={styles.appointmentHeader}>
                      <Text variant="titleMedium" style={styles.doctorName}>
                        Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                      </Text>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(apt.status) }]}
                        textStyle={styles.statusText}
                      >
                        {apt.status}
                      </Chip>
                    </View>
                    <Text variant="bodyMedium" style={styles.date}>
                      📅 {date ? format(date, 'MMM dd, yyyy') : 'N/A'} at {apt.appointmentTime}
                    </Text>
                    {apt.reason && (
                      <Text variant="bodySmall" style={styles.reason}>
                        Reason: {apt.reason}
                      </Text>
                    )}
                    {apt.notes && (
                      <Text variant="bodySmall" style={styles.notes}>
                        Notes: {apt.notes}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('BookAppointment')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
  },
  date: {
    marginTop: 4,
    color: '#666',
  },
  reason: {
    marginTop: 8,
    color: '#666',
  },
  notes: {
    marginTop: 4,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#999',
  },
  bookButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

