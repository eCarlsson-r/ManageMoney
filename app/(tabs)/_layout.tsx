import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="dashboard" screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="managebooks"
        options={{
          title: 'Manage Books',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookshelf" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name="view-dashboard" size={focused ? size + 4 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookkeeping"
        options={{
          title: 'Bookkeeping',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pen" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
