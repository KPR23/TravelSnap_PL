import { StyleSheet, Text, View, Pressable } from 'react-native';

import RatingStars from './RatingStars';

import type { TripData } from '@/types/trip';

export interface TripCardProps extends TripData {
  onDelete?: () => void;
}

export default function TripCard({ title, destination, date, rating, onDelete }: TripCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onDelete && (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>X</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.meta}>
        {destination} | {date}
      </Text>
      <RatingStars rating={rating} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 32,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 18,
  },
  meta: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});