import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { MedicalRecord } from '../../types';
import { format } from 'date-fns';

export default function MedicalRecordsScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/medical/records?patient=${user?.id}`);
      setRecords(response.data.data.medicalRecords || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {records.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No medical records found
              </Text>
            </Card.Content>
          </Card>
        ) : (
          records.map((record) => {
            const doctor = typeof record.doctor === 'object' ? record.doctor : null;
            const date = record.date ? new Date(record.date) : null;
            return (
              <Card key={record.id || record._id} style={styles.card}>
                <Card.Content>
                  <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.doctorName}>
                      Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                    </Text>
                    <Text variant="bodySmall" style={styles.date}>
                      {date ? format(date, 'MMM dd, yyyy') : 'N/A'}
                    </Text>
                  </View>

                  {record.chiefComplaint && (
                    <View style={styles.section}>
                      <Text variant="labelMedium" style={styles.label}>
                        Chief Complaint:
                      </Text>
                      <Text variant="bodyMedium">{record.chiefComplaint}</Text>
                    </View>
                  )}

                  {record.diagnosis && record.diagnosis.length > 0 && (
                    <View style={styles.section}>
                      <Text variant="labelMedium" style={styles.label}>
                        Diagnosis:
                      </Text>
                      <View style={styles.diagnosisList}>
                        {record.diagnosis.map((diag, index) => (
                          <Chip key={index} style={styles.diagnosisChip}>
                            {diag}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {record.treatment && (
                    <View style={styles.section}>
                      <Text variant="labelMedium" style={styles.label}>
                        Treatment:
                      </Text>
                      <Text variant="bodyMedium">{record.treatment}</Text>
                    </View>
                  )}

                  {record.followUp?.date && (
                    <View style={styles.section}>
                      <Text variant="labelMedium" style={styles.label}>
                        Follow-up Date:
                      </Text>
                      <Text variant="bodyMedium">
                        {format(new Date(record.followUp.date), 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
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
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  doctorName: {
    fontWeight: 'bold',
    flex: 1,
  },
  date: {
    color: '#666',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#1976d2',
  },
  diagnosisList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  diagnosisChip: {
    marginBottom: 4,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
});

