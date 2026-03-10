import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import { PaymentRecord, ReturnRecord } from '../types';
import { RippleButton } from './RippleButton';

interface Props {
  visible: boolean;
  type: 'payment' | 'return';
  onClose: () => void;
  onSave: (record: PaymentRecord | ReturnRecord) => void;
}

const CATEGORIES = {
  payment: ['时间', '金钱', '精力', '情感', '机会成本'],
  return: ['物质', '成长', '关系', '体验', '其他']
};

export const RecordInput: React.FC<Props> = ({ visible, type, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      return;
    }

    const record = {
      id: Date.now().toString(),
      date: new Date(),
      [type === 'payment' ? 'amount' : 'value']: value,
      description: description || '未备注',
      category: category || CATEGORIES[type][0]
    };

    onSave(record);
    setAmount('');
    setDescription('');
    setCategory('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.modal}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            {type === 'payment' ? '记录付出' : '记录回报'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>金额 *</Text>
            <TextInput
              style={styles.input}
              placeholder="输入金额"
              placeholderTextColor="#80868B"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>描述</Text>
            <TextInput
              style={styles.input}
              placeholder="简单描述一下"
              placeholderTextColor="#80868B"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>分类</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES[type].map((cat) => (
                <Pressable
                  key={cat}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                    category === cat && type === 'payment' && styles.categoryChipPayment,
                    category === cat && type === 'return' && styles.categoryChipReturn,
                    pressed && styles.categoryChipPressed
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.buttons}>
            <RippleButton
              onPress={handleClose}
              style={styles.cancelButton}
              rippleColor="rgba(0, 0, 0, 0.1)"
            >
              <View style={styles.buttonContent}>
                <Text style={styles.cancelText}>取消</Text>
              </View>
            </RippleButton>
            <RippleButton
              onPress={handleSave}
              style={[
                styles.saveButton,
                type === 'payment' ? styles.saveButtonPayment : styles.saveButtonReturn
              ]}
              rippleColor="rgba(255, 255, 255, 0.3)"
            >
              <View style={styles.buttonContent}>
                <Text style={styles.saveText}>保存</Text>
              </View>
            </RippleButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#D4D4D8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#18181B',
    letterSpacing: -0.4
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#18181B',
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  categoryChipActive: {
    borderColor: '#6366F1',
    borderWidth: 2
  },
  categoryChipPayment: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444'
  },
  categoryChipReturn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981'
  },
  categoryChipPressed: {
    opacity: 0.7
  },
  categoryText: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500'
  },
  categoryTextActive: {
    color: '#18181B',
    fontWeight: '600'
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E4E7'
  },
  buttonContent: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#71717A'
  },
  saveButton: {
    flex: 2,
    borderRadius: 20,
    overflow: 'hidden'
  },
  saveButtonPayment: {
    backgroundColor: '#EF4444'
  },
  saveButtonReturn: {
    backgroundColor: '#10B981'
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
