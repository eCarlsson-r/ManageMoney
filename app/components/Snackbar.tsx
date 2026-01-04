import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

type Props = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
};

const HEIGHT = 64;

export default function Snackbar({ message, visible, onDismiss, duration = 2000 }: Props) {
  const translateY = useRef(new Animated.Value(HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        hideTimer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(translateY, { toValue: HEIGHT, duration: 200, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start(() => onDismiss());
        }, duration);
      });
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: HEIGHT, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  const theme = useTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity, backgroundColor: theme.colors.primary },
      ]}
    >
      <Text style={[styles.text, { color: (theme.colors.onPrimary as string) || '#fff' }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: '#323232',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff' },
});
