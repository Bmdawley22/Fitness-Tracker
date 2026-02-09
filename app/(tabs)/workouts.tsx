import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

type SavedFilter = 'workouts' | 'exercises';

export default function SavedScreen() {
  const [selectedFilter, setSelectedFilter] = useState<SavedFilter>('workouts');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved</Text>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'workouts' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('workouts')}>
          <Text style={[styles.filterText, selectedFilter === 'workouts' && styles.filterTextActive]}>
            Saved Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'exercises' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('exercises')}>
          <Text style={[styles.filterText, selectedFilter === 'exercises' && styles.filterTextActive]}>
            Saved Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {selectedFilter === 'workouts' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved workouts yet</Text>
          </View>
        )}

        {selectedFilter === 'exercises' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved exercises yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
