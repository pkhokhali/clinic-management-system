import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import PatientDashboardScreen from '../screens/Patient/PatientDashboardScreen';
import AppointmentsScreen from '../screens/Patient/AppointmentsScreen';
import MedicalRecordsScreen from '../screens/Patient/MedicalRecordsScreen';
import BookAppointmentScreen from '../screens/Patient/BookAppointmentScreen';
import ProfileScreen from '../screens/Patient/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={PatientDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Records"
        component={MedicalRecordsScreen}
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {user?.role === 'Patient' && (
              <>
                <Stack.Screen name="Main" component={PatientTabs} />
                <Stack.Screen 
                  name="BookAppointment" 
                  component={BookAppointmentScreen}
                  options={{ title: 'Book Appointment', headerShown: true }}
                />
                <Stack.Screen 
                  name="MedicalRecords" 
                  component={MedicalRecordsScreen}
                  options={{ title: 'Medical Records', headerShown: true }}
                />
              </>
            )}
            {/* Add other role-based navigators here */}
            {user?.role === 'Doctor' && (
              <Stack.Screen name="Main" component={PatientTabs} />
            )}
            {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
              <Stack.Screen name="Main" component={PatientTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

