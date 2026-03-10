import { PaymentRecord, ReturnRecord } from '../types';

const DB_NAME = 'ValueAnalyzerDB';
const DB_VERSION = 1;
const PAYMENT_STORE = 'payments';
const RETURN_STORE = 'returns';
const SETTINGS_STORE = 'settings';

class StorageManager {
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

        // 创建付出记录存储
        if (!db.objectStoreNames.contains(PAYMENT_STORE)) {
          const paymentStore = db.createObjectStore(PAYMENT_STORE, { keyPath: 'id' });
          paymentStore.createIndex('date', 'date', { unique: false });
          paymentStore.createIndex('category', 'category', { unique: false });
        }

        // 创建回报记录存储
        if (!db.objectStoreNames.contains(RETURN_STORE)) {
          const returnStore = db.createObjectStore(RETURN_STORE, { keyPath: 'id' });
          returnStore.createIndex('date', 'date', { unique: false });
          returnStore.createIndex('category', 'category', { unique: false });
        }

        // 创建设置存储
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

  // 付出记录操作
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

  // 回报记录操作
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

  // 设置操作
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

  // 清空所有数据
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

  // 导出数据（用于备份）
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

  // 导入数据（用于恢复）
  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.data) {
        throw new Error('Invalid data format');
      }

      // 清空现有数据
      await this.clearAll();

      // 导入付出记录
      if (data.data.payments) {
        for (const payment of data.data.payments) {
          await this.addPayment({
            ...payment,
            date: new Date(payment.date)
          });
        }
      }

      // 导入回报记录
      if (data.data.returns) {
        for (const returnRecord of data.data.returns) {
          await this.addReturn({
            ...returnRecord,
            date: new Date(returnRecord.date)
          });
        }
      }

      // 导入设置
      if (data.data.currentAge) {
        await this.saveSetting('currentAge', data.data.currentAge);
      }
    } catch (error) {
      throw new Error('Failed to import data: ' + (error as Error).message);
    }
  }
}

export const storage = new StorageManager();
