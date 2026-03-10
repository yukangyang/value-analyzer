import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PaymentRecord, ReturnRecord, AnalysisResult } from './src/types';
import { ValueCalculator } from './src/utils/calculator';
import { RecordInput } from './src/components/RecordInput';
import { AnalysisDisplay } from './src/components/AnalysisDisplay';
import { RippleButton } from './src/components/RippleButton';
import { DataManager } from './src/components/DataManager';
import { DrawerMenu } from './src/components/DrawerMenu';
import { DogLogo } from './src/components/DogLogo';
import { storage } from './src/utils/storage';

export default function App() {
  const [currentAge, setCurrentAge] = useState('25');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [showReturnInput, setShowReturnInput] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const calculator = new ValueCalculator();

  // 初始化数据库并加载数据
  useEffect(() => {
    const initStorage = async () => {
      try {
        await storage.init();

        // 加载保存的数据
        const savedPayments = await storage.getAllPayments();
        const savedReturns = await storage.getAllReturns();
        const savedAge = await storage.getSetting('currentAge');

        setPayments(savedPayments);
        setReturns(savedReturns);
        if (savedAge) {
          setCurrentAge(savedAge);
        }
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        Alert.alert('错误', '数据加载失败，请刷新页面重试');
      } finally {
        setIsLoading(false);
      }
    };

    initStorage();
  }, []);

  // 计算分析结果
  useEffect(() => {
    if (payments.length > 0 || returns.length > 0) {
      const age = parseInt(currentAge) || 25;
      const analysis = calculator.analyze(payments, returns, age);
      setResult(analysis);
    } else {
      setResult(null);
    }
  }, [payments, returns, currentAge]);

  // 保存年龄设置
  useEffect(() => {
    if (!isLoading) {
      storage.saveSetting('currentAge', currentAge).catch(console.error);
    }
  }, [currentAge, isLoading]);

  const handleAddPayment = async (record: PaymentRecord) => {
    try {
      await storage.addPayment(record);
      setPayments([...payments, record]);
    } catch (error) {
      console.error('Failed to add payment:', error);
      Alert.alert('错误', '保存付出记录失败');
    }
  };

  const handleAddReturn = async (record: ReturnRecord) => {
    try {
      await storage.addReturn(record);
      setReturns([...returns, record]);
    } catch (error) {
      console.error('Failed to add return:', error);
      Alert.alert('错误', '保存回报记录失败');
    }
  };

  const handleDataCleared = async () => {
    try {
      const savedPayments = await storage.getAllPayments();
      const savedReturns = await storage.getAllReturns();
      const savedAge = await storage.getSetting('currentAge');

      setPayments(savedPayments);
      setReturns(savedReturns);
      if (savedAge) {
        setCurrentAge(savedAge);
      } else {
        setCurrentAge('25');
      }
    } catch (error) {
      console.error('Failed to reload data:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>加载数据中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          onPress={() => setShowDrawer(true)}
          style={({ pressed }) => [
            styles.logoButton,
            pressed && styles.logoButtonPressed
          ]}
        >
          <DogLogo size={36} color="#6366F1" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AnalysisDisplay result={result} payments={payments} returns={returns} />
      </ScrollView>

      <View style={styles.actionBar}>
        <RippleButton
          onPress={() => setShowPaymentInput(true)}
          style={styles.actionButton}
          rippleColor="rgba(239, 68, 68, 0.2)"
        >
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionIcon, styles.actionIconPayment]}>
              <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />
            </View>
            <Text style={styles.actionLabel}>记录付出</Text>
          </View>
        </RippleButton>
        <RippleButton
          onPress={() => setShowReturnInput(true)}
          style={styles.actionButton}
          rippleColor="rgba(16, 185, 129, 0.2)"
        >
          <View style={styles.actionButtonContent}>
            <View style={[styles.actionIcon, styles.actionIconReturn]}>
              <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionLabel}>记录回报</Text>
          </View>
        </RippleButton>
      </View>

      <RecordInput
        visible={showPaymentInput}
        type="payment"
        onClose={() => setShowPaymentInput(false)}
        onSave={handleAddPayment}
      />

      <RecordInput
        visible={showReturnInput}
        type="return"
        onClose={() => setShowReturnInput(false)}
        onSave={handleAddReturn}
      />

      <DataManager
        visible={showDataManager}
        onClose={() => setShowDataManager(false)}
        onDataCleared={handleDataCleared}
      />

      <DrawerMenu
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        onOpenSettings={() => setShowDataManager(true)}
        currentAge={currentAge}
        onAgeChange={setCurrentAge}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    alignItems: 'flex-start'
  },
  logoButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  logoButtonPressed: {
    opacity: 0.6
  },
  content: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  actionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  actionIconPayment: {
    backgroundColor: 'transparent'
  },
  actionIconReturn: {
    backgroundColor: 'transparent'
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181B',
    letterSpacing: -0.2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500'
  }
});
