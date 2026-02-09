import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';

export default function SearchScreen() {
  const [tabName] = useState('Search');

  return (
    <View style={styles.container}>
      <Text style={styles.tabName}>{tabName}</Text>
      {/* Rest of page blank for now */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 16,
    paddingLeft: 16,
  },
  tabName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
