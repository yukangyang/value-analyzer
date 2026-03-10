import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentRecord, ReturnRecord } from '../types';

const DB_NAME = 'ValueAnalyzerDB';
const DB_VERSION = 1;
const PAYMENT_STORE = 'payments';
const RETURN_STORE = 'returns';
const SETTINGS_STORE = 'settings';

// 平台适配的存储接口
interface StorageAdapter {
  init(): Promise<void>;
  addPayment(record: PaymentRecord): Promise<void>;
  getAllPayments(): Promise<PaymentRecord[]>;
  deletePayment(id: string): Promise<void>;
  addReturn(record: ReturnRecord): Promise<void>;
  getAllReturns(): Promise<ReturnRecord[]>;
  deleteReturn(id: string): Promise<void>;
  saveSetting(key: string, value: any): Promise<void>;
  getSetting(key: string): Promise<any>;
  clearAll(): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonString: string): Promise<void>;
}

// IndexedDB 实现（Web端）
class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(PAYMENT_STORE)) {
          const paymentStore = db.createObjectStore(PAYMENT_STORE, { keyPath: 'id' });
          paymentStore.createIndex('date', 'date', { unique: false });
          paymentStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(RETURN_STORE)) {
          const returnStore = db.createObjectStore(RETURN_STORE, { keyPath: 'id' });
          returnStore.createIndex('date', 'date', { unique: false });
          returnStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async addPayment(record: PaymentRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(PAYMENT_STORE, 'readwrite');
      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(PAYMENT_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result.map((r: any) => ({
          ...r,
          date: new Date(r.date)
        }));
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deletePayment(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(PAYMENT_STORE, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addReturn(record: ReturnRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(RETURN_STORE, 'readwrite');
      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReturns(): Promise<ReturnRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(RETURN_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result.map((r: any) => ({
          ...r,
          date: new Date(r.date)
        }));
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteReturn(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(RETURN_STORE, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(SETTINGS_STORE, 'readwrite');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(SETTINGS_STORE);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(
        [PAYMENT_STORE, RETURN_STORE, SETTINGS_STORE],
        'readwrite'
      );

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      transaction.objectStore(PAYMENT_STORE).clear();
      transaction.objectStore(RETURN_STORE).clear();
      transaction.objectStore(SETTINGS_STORE).clear();
    });
  }

  async exportData(): Promise<string> {
    const payments = await this.getAllPayments();
    const returns = await this.getAllReturns();
    const currentAge = await this.getSetting('currentAge');

    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        payments,
        returns,
        currentAge
      }
    }, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.data) {
        throw new Error('Invalid data format');
      }

      await this.clearAll();

      if (data.data.payments) {
        for (const payment of data.data.payments) {
          await this.addPayment({
            ...payment,
            date: new Date(payment.date)
          });
        }
      }

      if (data.data.returns) {
        for (const returnRecord of data.data.returns) {
          await this.addReturn({
            ...returnRecord,
            date: new Date(returnRecord.date)
          });
        }
      }

      if (data.data.currentAge) {
        await this.saveSetting('currentAge', data.data.currentAge);
      }
    } catch (error) {
      throw new Error('Failed to import data: ' + (error as Error).message);
    }
  }
}

// AsyncStorage 实现（移动端）
class AsyncStorageAdapter implements StorageAdapter {
  private getKey(store: string, id?: string): string {
    return id ? `${DB_NAME}:${store}:${id}` : `${DB_NAME}:${store}`;
  }

  private getListKey(store: string): string {
    return `${DB_NAME}:${store}:list`;
  }

  async init(): Promise<void> {
    // AsyncStorage 不需要初始化
  }

  async addPayment(record: PaymentRecord): Promise<void> {
    const key = this.getKey(PAYMENT_STORE, record.id);
    const listKey = this.getListKey(PAYMENT_STORE);

    await AsyncStorage.setItem(key, JSON.stringify(record));

    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];
    if (!list.includes(record.id)) {
      list.push(record.id);
      await AsyncStorage.setItem(listKey, JSON.stringify(list));
    }
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    const listKey = this.getListKey(PAYMENT_STORE);
    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];

    const records: PaymentRecord[] = [];
    for (const id of list) {
      const key = this.getKey(PAYMENT_STORE, id);
      const recordStr = await AsyncStorage.getItem(key);
      if (recordStr) {
        const record = JSON.parse(recordStr);
        records.push({
          ...record,
          date: new Date(record.date)
        });
      }
    }

    return records;
  }

  async deletePayment(id: string): Promise<void> {
    const key = this.getKey(PAYMENT_STORE, id);
    const listKey = this.getListKey(PAYMENT_STORE);

    await AsyncStorage.removeItem(key);

    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];
    const newList = list.filter((itemId: string) => itemId !== id);
    await AsyncStorage.setItem(listKey, JSON.stringify(newList));
  }

  async addReturn(record: ReturnRecord): Promise<void> {
    const key = this.getKey(RETURN_STORE, record.id);
    const listKey = this.getListKey(RETURN_STORE);

    await AsyncStorage.setItem(key, JSON.stringify(record));

    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];
    if (!list.includes(record.id)) {
      list.push(record.id);
      await AsyncStorage.setItem(listKey, JSON.stringify(list));
    }
  }

  async getAllReturns(): Promise<ReturnRecord[]> {
    const listKey = this.getListKey(RETURN_STORE);
    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];

    const records: ReturnRecord[] = [];
    for (const id of list) {
      const key = this.getKey(RETURN_STORE, id);
      const recordStr = await AsyncStorage.getItem(key);
      if (recordStr) {
        const record = JSON.parse(recordStr);
        records.push({
          ...record,
          date: new Date(record.date)
        });
      }
    }

    return records;
  }

  async deleteReturn(id: string): Promise<void> {
    const key = this.getKey(RETURN_STORE, id);
    const listKey = this.getListKey(RETURN_STORE);

    await AsyncStorage.removeItem(key);

    const listStr = await AsyncStorage.getItem(listKey);
    const list = listStr ? JSON.parse(listStr) : [];
    const newList = list.filter((itemId: string) => itemId !== id);
    await AsyncStorage.setItem(listKey, JSON.stringify(newList));
  }

  async saveSetting(key: string, value: any): Promise<void> {
    const storageKey = this.getKey(SETTINGS_STORE, key);
    await AsyncStorage.setItem(storageKey, JSON.stringify({ key, value }));
  }

  async getSetting(key: string): Promise<any> {
    const storageKey = this.getKey(SETTINGS_STORE, key);
    const dataStr = await AsyncStorage.getItem(storageKey);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      return data.value;
    }
    return undefined;
  }

  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const dbKeys = keys.filter(key => key.startsWith(`${DB_NAME}:`));
    await AsyncStorage.multiRemove(dbKeys);
  }

  async exportData(): Promise<string> {
    const payments = await this.getAllPayments();
    const returns = await this.getAllReturns();
    const currentAge = await this.getSetting('currentAge');

    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        payments,
        returns,
        currentAge
      }
    }, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.data) {
        throw new Error('Invalid data format');
      }

      await this.clearAll();

      if (data.data.payments) {
        for (const payment of data.data.payments) {
          await this.addPayment({
            ...payment,
            date: new Date(payment.date)
          });
        }
      }

      if (data.data.returns) {
        for (const returnRecord of data.data.returns) {
          await this.addReturn({
            ...returnRecord,
            date: new Date(returnRecord.date)
          });
        }
      }

      if (data.data.currentAge) {
        await this.saveSetting('currentAge', data.data.currentAge);
      }
    } catch (error) {
      throw new Error('Failed to import data: ' + (error as Error).message);
    }
  }
}

// 根据平台选择适配器
class StorageManager implements StorageAdapter {
  private adapter: StorageAdapter;

  constructor() {
    this.adapter = Platform.OS === 'web'
      ? new IndexedDBAdapter()
      : new AsyncStorageAdapter();
  }

  async init(): Promise<void> {
    return this.adapter.init();
  }

  async addPayment(record: PaymentRecord): Promise<void> {
    return this.adapter.addPayment(record);
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    return this.adapter.getAllPayments();
  }

  async deletePayment(id: string): Promise<void> {
    return this.adapter.deletePayment(id);
  }

  async addReturn(record: ReturnRecord): Promise<void> {
    return this.adapter.addReturn(record);
  }

  async getAllReturns(): Promise<ReturnRecord[]> {
    return this.adapter.getAllReturns();
  }

  async deleteReturn(id: string): Promise<void> {
    return this.adapter.deleteReturn(id);
  }

  async saveSetting(key: string, value: any): Promise<void> {
    return this.adapter.saveSetting(key, value);
  }

  async getSetting(key: string): Promise<any> {
    return this.adapter.getSetting(key);
  }

  async clearAll(): Promise<void> {
    return this.adapter.clearAll();
  }

  async exportData(): Promise<string> {
    return this.adapter.exportData();
  }

  async importData(jsonString: string): Promise<void> {
    return this.adapter.importData(jsonString);
  }
}

export const storage = new StorageManager();
