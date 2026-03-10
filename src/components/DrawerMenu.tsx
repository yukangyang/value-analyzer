import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RippleButton } from './RippleButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  currentAge: string;
  onAgeChange: (age: string) => void;
}

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.8, 320);

export const DrawerMenu: React.FC<Props> = ({ visible, onClose, onOpenSettings, currentAge, onAgeChange }) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const handleSettingsPress = () => {
    onClose();
    setTimeout(() => {
      onOpenSettings();
    }, 300);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={styles.backdropPress} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="heart" size={28} color="#EF4444" />
                </View>
              </View>
              <Text style={styles.appTitle}>现值分析</Text>
              <Text style={styles.appSubtitle}>科学量化你的付出</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>关于本应用</Text>
              <Text style={styles.descriptionText}>
                这是一个帮助你理性分析感情投入与回报的工具。通过记录你的付出和收获，
                使用时间加权和年龄加权算法，计算出真实的投入产出比。
              </Text>
              <Text style={styles.descriptionText}>
                让数据说话，帮你做出更明智的决定。
              </Text>
            </View>

            {/* Age Setting */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>个人信息</Text>
              <View style={styles.ageSettingCard}>
                <View style={styles.ageSettingHeader}>
                  <Ionicons name="person-outline" size={20} color="#6366F1" />
                  <Text style={styles.ageSettingLabel}>当前年龄</Text>
                </View>
                <View style={styles.ageInputContainer}>
                  <TextInput
                    style={styles.ageInputField}
                    value={currentAge}
                    onChangeText={onAgeChange}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="25"
                    placeholderTextColor="#A1A1AA"
                  />
                  <Text style={styles.ageInputUnit}>岁</Text>
                </View>
                <Text style={styles.ageSettingHint}>
                  年龄用于计算加权回报，影响最终性价比分数
                </Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>功能</Text>

              <RippleButton
                onPress={handleSettingsPress}
                style={styles.menuItem}
                rippleColor="rgba(99, 102, 241, 0.1)"
              >
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                    <Ionicons name="settings-outline" size={22} color="#6366F1" />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>数据管理</Text>
                    <Text style={styles.menuDesc}>导出、导入、清空数据</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
                </View>
              </RippleButton>

            </View>


            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
              <Text style={styles.footerText}>Made with 💔 for 舔狗们</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  backdropPress: {
    flex: 1
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5
  },
  drawerContent: {
    flex: 1
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    alignItems: 'center'
  },
  logoContainer: {
    marginBottom: 16
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECACA'
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  appSubtitle: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '400'
  },
  descriptionCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 8
  },
  descriptionText: {
    fontSize: 13,
    color: '#52525B',
    lineHeight: 20,
    marginBottom: 8
  },
  settingSection: {
    padding: 16,
    paddingTop: 8
  },
  ageSettingCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  ageSettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  ageSettingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 8
  },
  ageInputField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#18181B',
    textAlign: 'center',
    padding: 0,
    width: '100%'
  },
  ageInputUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 8
  },
  ageSettingHint: {
    fontSize: 11,
    color: '#6366F1',
    lineHeight: 16
  },
  menuSection: {
    padding: 16,
    paddingTop: 8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4
  },
  menuItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden'
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuText: {
    flex: 1
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 2
  },
  menuDesc: {
    fontSize: 12,
    color: '#71717A'
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  formulaItem: {
    marginBottom: 10
  },
  formulaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 4
  },
  formulaText: {
    fontSize: 12,
    color: '#6366F1',
    fontFamily: 'monospace'
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 4
  },
  footerText: {
    fontSize: 11,
    color: '#A1A1AA'
  }
});
