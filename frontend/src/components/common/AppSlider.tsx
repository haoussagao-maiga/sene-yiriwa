import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../styles/colors';

interface Slide {
  id: string;
  type: 'image' | 'video';
  source: string;
}

interface AppSliderProps {
  slides: Slide[];
  height?: number;
  showPagination?: boolean;
  showNavigationButtons?: boolean;
}

const { width } = Dimensions.get('window');

const AppSlider: React.FC<AppSliderProps> = ({
  slides,
  height = 250,
  showPagination = true,
  showNavigationButtons = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { height }]}>
      {/* Image */}
      {currentSlide.type === 'image' && (
        <Image
          source={{ uri: currentSlide.source }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      )}

      {/* Navigation Buttons */}
      {showNavigationButtons && slides.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Icon
              name="chevron-left"
              size={24}
              color={currentIndex === 0 ? colors.gray[400] : colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={handleNext}
            disabled={currentIndex === slides.length - 1}
          >
            <Icon
              name="chevron-right"
              size={24}
              color={currentIndex === slides.length - 1 ? colors.gray[400] : colors.white}
            />
          </TouchableOpacity>
        </>
      )}

      {/* Pagination */}
      {showPagination && slides.length > 1 && (
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Counter */}
      {slides.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {slides.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: colors.gray[100],
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  navButtonLeft: {
    left: 10,
  },
  navButtonRight: {
    right: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: colors.white,
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
  },
  counterText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AppSlider;
