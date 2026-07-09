export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  compatibilityVersion: string;
  capabilities: PluginCapability[];
  permissions: PluginPermission[];
  entryPoint: string;
  dependencies: string[];
  configSchema: Record<string, unknown> | null;
}

export enum PluginCapability {
  Collector = 'collector',
  NotificationProvider = 'notificationProvider',
  DashboardWidget = 'dashboardWidget',
  SidebarMenu = 'sidebarMenu',
  ApiExtension = 'apiExtension',
  WebSocketChannel = 'websocketChannel',
  AutomationAction = 'automationAction',
  SchedulerTask = 'schedulerTask',
  AiProvider = 'aiProvider',
  EventConsumer = 'eventConsumer',
}

export enum PluginPermission {
  ReadMetrics = 'readMetrics',
  SendNotification = 'sendNotification',
  ExecuteAutomation = 'executeAutomation',
  AccessDatabase = 'accessDatabase',
  AccessRedis = 'accessRedis',
  AccessFileSystem = 'accessFileSystem',
  AccessNetwork = 'accessNetwork',
}

export interface PluginState {
  manifest: PluginManifest;
  status: PluginStatus;
  version: string;
  resourceUsage: PluginResourceUsage;
  errorCount: number;
  lastError: string | null;
  activatedAt: string | null;
}

export enum PluginStatus {
  Discovered = 'discovered',
  Validating = 'validating',
  Registered = 'registered',
  Active = 'active',
  Suspended = 'suspended',
  Failed = 'failed',
  Unloaded = 'unloaded',
}

export interface PluginResourceUsage {
  cpuPercent: number;
  memoryBytes: number;
  storageBytes: number;
}
