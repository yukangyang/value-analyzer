import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RippleButton } from './RippleButton';
import { storage } from '../utils/storage';

interface Props {
  visible: boolean;
  onClose: () => void;
  onDataCleared: () => void;
}

export const DataManager: React.FC<Props> = ({ visible, onClose, onDataCleared }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      '确认清空',
      '此操作将删除所有记录，无法恢复。确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await storage.clearAll();
              onDataCleared();
              onClose();
              Alert.alert('成功', '所有数据已清空');
            } catch (error) {
              Alert.alert('错误', '清空数据失败');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      setIsProcessing(true);
      const jsonData = await storage.exportData();

      if (Platform.OS === 'web') {
        // Web平台：下载为文件
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `value-analyzer-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('成功', '数据已导出到下载文件夹');
      } else {
        // 移动端：复制到剪贴板
        Alert.alert('导出数据', jsonData, [
          { text: '关闭', style: 'cancel' }
        ]);
      }
    } catch (error) {
      Alert.alert('错误', '导出数据失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = () => {
    if (Platform.OS === 'web') {
      // Web平台：文件选择
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          try {
            setIsProcessing(true);
            const text = await file.text();
            await storage.importData(text);
            onDataCleared(); // 触发重新加载
            onClose();
            Alert.alert('成功', '数据已导入');
          } catch (error) {
            Alert.alert('错误', '导入数据失败：' + (error as Error).message);
          } finally {
            setIsProcessing(false);
          }
        }
      };
      input.click();
    } else {
      Alert.alert('提示', '移动端暂不支持导入功能');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.modal}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Ionicons name="settings-outline" size={24} color="#18181B" />
          <Text style={styles.title}>数据管理</Text>
        </View>

        <View style={styles.options}>
          <RippleButton
            onPress={handleExportData}
            style={styles.optionButton}
            rippleColor="rgba(99, 102, 241, 0.1)"
            disabled={isProcessing}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="download-outline" size={24} color="#6366F1" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>导出数据</Text>
                <Text style={styles.optionDesc}>备份所有记录到本地文件</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
            </View>
          </RippleButton>

          <RippleButton
            onPress={handleImportData}
            style={styles.optionButton}
            rippleColor="rgba(99, 102, 241, 0.1)"
            disabled={isProcessing}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="cloud-upload-outline" size={24} color="#6366F1" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>导入数据</Text>
                <Text style={styles.optionDesc}>从备份文件恢复记录</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
            </View>
          </RippleButton>

          <RippleButton
            onPress={handleClearData}
            style={styles.optionButton}
            rippleColor="rgba(239, 68, 68, 0.1)"
            disabled={isProcessing}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIcon}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: '#EF4444' }]}>清空所有数据</Text>
                <Text style={styles.optionDesc}>删除所有记录，无法恢复</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
            </View>
          </RippleButton>
        </View>

        <RippleButton
          onPress={onClose}
          style={styles.closeButton}
          rippleColor="rgba(0, 0, 0, 0.05)"
        >
          <View style={styles.closeButtonContent}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </View>
        </RippleButton>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D4D4D8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#18181B',
    letterSpacing: -0.4
  },
  options: {
    gap: 12,
    marginBottom: 20
  },
  optionButton: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    overflow: 'hidden'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionText: {
    flex: 1
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 2
  },
  optionDesc: {
    fontSize: 13,
    color: '#71717A'
  },
  closeButton: {
    backgroundColor: '#F4F4F5',
    borderRadius: 16,
    overflow: 'hidden'
  },
  closeButtonContent: {
    paddingVertical: 14,
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#71717A'
  }
});
