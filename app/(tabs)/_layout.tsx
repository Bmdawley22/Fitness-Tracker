import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#222',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Today's Workout",
          tabBarIcon: ({ color }) => <Ionicons name="barbell-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
