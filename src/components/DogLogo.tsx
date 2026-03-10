import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export const DogLogo: React.FC<Props> = ({ size = 32, color = '#6366F1' }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* 狗头轮廓 */}
        <Path
          d="M24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z"
          fill={color}
          opacity="0.1"
        />

        {/* 左耳 */}
        <Path
          d="M12 14C12 14 10 10 8 12C6 14 8 18 10 18C12 18 12 14 12 14Z"
          fill={color}
        />

        {/* 右耳 */}
        <Path
          d="M36 14C36 14 38 10 40 12C42 14 40 18 38 18C36 18 36 14 36 14Z"
          fill={color}
        />

        {/* 脸部 */}
        <Circle cx="24" cy="24" r="14" fill={color} opacity="0.2" />

        {/* 左眼 */}
        <Circle cx="19" cy="22" r="2" fill={color} />

        {/* 右眼 */}
        <Circle cx="29" cy="22" r="2" fill={color} />

        {/* 鼻子 */}
        <Path
          d="M24 26C25.1046 26 26 26.4477 26 27C26 27.5523 25.1046 28 24 28C22.8954 28 22 27.5523 22 27C22 26.4477 22.8954 26 24 26Z"
          fill={color}
        />

        {/* 舌头（舔狗特征） */}
        <Path
          d="M24 28C24 28 22 32 20 33C18 34 16 32 18 30C20 28 24 28 24 28Z"
          fill="#EF4444"
          opacity="0.8"
        />

        {/* 嘴巴微笑 */}
        <Path
          d="M18 30C18 30 20 32 24 32C28 32 30 30 30 30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* 爱心（舔狗元素） */}
        <Path
          d="M34 16C34 16 35 14 37 15C39 16 38 18 36 19C34 20 32 18 32 18C32 18 30 20 28 19C26 18 25 16 27 15C29 14 30 16 30 16"
          fill="#EF4444"
          opacity="0.6"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
