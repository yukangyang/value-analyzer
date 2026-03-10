import React, { useState } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Text
} from 'react-native';

interface RippleButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
  rippleColor?: string;
  disabled?: boolean;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  onPress,
  style,
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  disabled = false
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; scale: Animated.Value; opacity: Animated.Value }>>([]);

  const handlePress = (event: any) => {
    if (disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    const rippleId = Date.now();
    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    setRipples(prev => [...prev, { id: rippleId, x: locationX, y: locationY, scale, opacity }]);

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 4,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    });

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        style,
        pressed && styles.pressed
      ]}
      disabled={disabled}
    >
      <View style={styles.container}>
        {children}
        {ripples.map(ripple => (
          <Animated.View
            key={ripple.id}
            style={[
              styles.ripple,
              {
                backgroundColor: rippleColor,
                left: ripple.x - 50,
                top: ripple.y - 50,
                transform: [{ scale: ripple.scale }],
                opacity: ripple.opacity
              }
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative'
  },
  pressed: {
    opacity: 0.9
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50
  }
});
