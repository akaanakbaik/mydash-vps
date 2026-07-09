export enum DeliveryState {
  Created = 'created',
  Queued = 'queued',
  WaitingWorker = 'waitingWorker',
  Preparing = 'preparing',
  Validating = 'validating',
  WaitingProvider = 'waitingProvider',
  Sending = 'sending',
  WaitingAcknowledgement = 'waitingAcknowledgement',
  Verifying = 'verifying',
  Delivered = 'delivered',
  Retry = 'retry',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Failed = 'failed',
  Recovery = 'recovery',
}

export interface DeliveryContext {
  deliveryId: string;
  notificationId: string;
  workspaceId: string;
  serverId: string;
  provider: string;
  workerId: string | null;
  retryCount: number;
  maxRetry: number;
  createdAt: Date;
  expiresAt: Date;
  currentState: DeliveryState;
  priority: number;
  correlationId: string;
  payloadHash: string;
}

export interface NotificationTemplateConfig {
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
}

export const DEFAULT_TEMPLATES: Record<string, NotificationTemplateConfig> = {
  cpu_warning: {
    headerTemplate: '⚠️ CPU Warning',
    bodyTemplate: 'Server: {hostname}\nCPU: {value}%\nThreshold: {threshold}%\nDuration: {duration}s\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring',
  },
  cpu_critical: {
    headerTemplate: '🔴 CPU Critical',
    bodyTemplate: 'Server: {hostname}\nCPU: {value}%\nThreshold: {threshold}%\nDuration: {duration}s\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring — Immediate attention required',
  },
  memory_warning: {
    headerTemplate: '⚠️ Memory Warning',
    bodyTemplate: 'Server: {hostname}\nRAM: {value}%\nAvailable: {available}\nDuration: {duration}s\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring',
  },
  memory_critical: {
    headerTemplate: '🔴 Memory Critical',
    bodyTemplate: 'Server: {hostname}\nRAM: {value}%\nSwap: {swap}%\nDuration: {duration}s\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring — Immediate attention required',
  },
  disk_warning: {
    headerTemplate: '⚠️ Disk Warning',
    bodyTemplate: 'Server: {hostname}\nDisk: {value}%\nMount: {mount}\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring',
  },
  recovery: {
    headerTemplate: '✅ Recovery',
    bodyTemplate: 'Server: {hostname}\nMetric: {metric}\nStatus: recovered\nDuration: {duration}s\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring',
  },
  health_degraded: {
    headerTemplate: '⚠️ Health Score Degraded',
    bodyTemplate: 'Server: {hostname}\nHealth Score: {score} → {previousScore}\nGrade: {grade}\nFactors: {factors}\nTime: {timestamp}',
    footerTemplate: 'MyDash Monitoring',
  },
};
