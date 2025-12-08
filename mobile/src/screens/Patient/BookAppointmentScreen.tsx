import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { User } from '../../types';

export default function BookAppointmentScreen({ navigation }: any) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users?role=Doctor&isActive=true');
      setDoctors(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.doctor || !formData.appointmentDate || !formData.appointmentTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/appointments', {
        patient: user?.id,
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes,
      });
      Alert.alert('Success', 'Appointment booked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === formData.doctor || d._id === formData.doctor);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Book Appointment
          </Text>

          <Text style={styles.label}>Select Doctor *</Text>
          <View style={styles.doctorsList}>
            {doctors.map((doctor) => (
              <Chip
                key={doctor.id || doctor._id}
                selected={formData.doctor === (doctor.id || doctor._id)}
                onPress={() => setFormData({ ...formData, doctor: doctor.id || doctor._id || '' })}
                style={styles.doctorChip}
              >
                Dr. {doctor.firstName} {doctor.lastName}
                {doctor.specialization && ` - ${doctor.specialization}`}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Appointment Date *"
            value={formData.appointmentDate}
            onChangeText={(text) => setFormData({ ...formData, appointmentDate: text })}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TextInput
            label="Appointment Time *"
            value={formData.appointmentTime}
            onChangeText={(text) => setFormData({ ...formData, appointmentTime: text })}
            mode="outlined"
            placeholder="HH:MM (24-hour format)"
            style={styles.input}
          />

          <TextInput
            label="Reason for Visit"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Book Appointment
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  doctorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  doctorChip: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
});

