import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
}

export default function RatingStars({ rating, maxStars = 5 }: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(rating, maxStars));
  const stars: ReactElement[] = [];

  for (let i = 1; i <= maxStars; i++) {
    stars.push(
      <Text key={i} style={styles.star}>
        {i <= normalizedRating ? '★' : '☆'}
      </Text>
    );
  }

  return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 2,
  },
  star: {
    fontSize: 16,
    color: '#e94560',
    marginRight: 2,
  },
});