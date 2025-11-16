// src/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from './api';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = 'offline_operations_queue';

export const offlineService = {
  async queueOperation(operation: string, data: any) {
    try {
      const queue = await this.getQueue();
      queue.push({
        operation,
        data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('Operation queued offline:', operation);
    } catch (error) {
      console.error('Failed to queue operation:', error);
    }
  },

  async getQueue(): Promise<any[]> {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  },

  async clearQueue() {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  },

  async syncPendingOperations() {
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const successfulOps = [];
    const failedOps = [];

    for (const op of queue) {
      try {
        if (op.operation === 'REGISTER_USER') {
          await userService.register(op.data);
          successfulOps.push(op.id);
        }
        // Add other operation types as needed
      } catch (error) {
        console.error('Failed to sync operation:', op.operation, error);
        failedOps.push(op);
      }
    }

    // Update queue with failed operations only
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedOps));
    
    return {
      successful: successfulOps.length,
      failed: failedOps.length
    };
  },

  async startSyncListener() {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.syncPendingOperations();
      }
    });
  }
};