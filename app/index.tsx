import { ScrollView, StyleSheet } from 'react-native';

import TripCard from '@/components/TripCard';
import type { TripCardProps } from '@/components/TripCard';

const trips: TripCardProps[] = [
  {
    title: 'Wakacje w Polsce',
    destination: 'Warszawa',
    date: '2026-03-07',
    rating: 5,
  },
  {
    title: 'Weekend w Krakowie',
    destination: 'Kraków',
    date: '2026-03-14',
    rating: 4,
  },
  {
    title: 'Wyjazd na Bali',
    destination: 'Ubud',
    date: '2026-07-20',
    rating: 3,
  },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      {trips.map((trip) => (
        <TripCard
          key={`${trip.title}-${trip.date}`}
          title={trip.title}
          destination={trip.destination}
          date={trip.date}
          rating={trip.rating}
        />
      ))}
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
});
