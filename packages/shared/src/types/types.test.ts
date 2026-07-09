import { describe, it, expect } from 'vitest';
import {
  UserRole, SessionStatus, Severity, Priority,
  PluginCapability, BackupMode,
  MetricType, ERROR_CODES, LIMITS, DEFAULTS,
  WebSocketChannel,
  LogLevel, AuditResult,
  createEmail, createPercentage, createNonEmptyString,
  success, failure, AppError,
} from '../index.js';

describe('UserRole', () => {
  it('Owner', () => { expect(UserRole.Owner).toBe('owner'); });
  it('Admin', () => { expect(UserRole.Administrator).toBe('administrator'); });
  it('ReadOnly', () => { expect(UserRole.ReadOnly).toBe('readOnly'); });
});

describe('SessionStatus', () => {
  it('Active', () => { expect(SessionStatus.Active).toBe('active'); });
  it('Expired', () => { expect(SessionStatus.Expired).toBe('expired'); });
});

describe('MetricType', () => {
  it('CPU', () => { expect(MetricType.CPU).toBe('cpu'); });
  it('Memory', () => { expect(MetricType.Memory).toBe('memory'); });
  it('Disk', () => { expect(MetricType.Disk).toBe('disk'); });
  it('Network', () => { expect(MetricType.Network).toBe('network'); });
});

describe('Severity', () => {
  it('Info', () => { expect(Severity.Information).toBe('information'); });
  it('Warn', () => { expect(Severity.Warning).toBe('warning'); });
  it('Error', () => { expect(Severity.Error).toBe('error'); });
  it('Critical', () => { expect(Severity.Critical).toBe('critical'); });
});

describe('Priority', () => {
  it('Low', () => { expect(Priority.Low).toBe(1); });
  it('Normal', () => { expect(Priority.Normal).toBe(2); });
  it('High', () => { expect(Priority.High).toBe(3); });
  it('Critical', () => { expect(Priority.Critical).toBe(4); });
});

describe('ERROR_CODES', () => {
  it('VALIDATION', () => { expect(ERROR_CODES.VALIDATION.INVALID_INPUT).toBe('ERR_VALIDATION_INVALID_INPUT'); });
  it('AUTH', () => { expect(ERROR_CODES.AUTHENTICATION.SESSION_EXPIRED).toBe('ERR_AUTH_SESSION_EXPIRED'); });
  it('NOT_FOUND', () => { expect(ERROR_CODES.NOT_FOUND.SERVER).toBe('ERR_NOT_FOUND_SERVER'); });
  it('INTERNAL', () => { expect(ERROR_CODES.INTERNAL.UNEXPECTED).toBe('ERR_INTERNAL_UNEXPECTED'); });
});

describe('LIMITS', () => {
  it('AI_TIMEOUT', () => { expect(LIMITS.AI_TIMEOUT_SECONDS).toBe(32); });
  it('SESSION_LIFETIME', () => { expect(LIMITS.SESSION_LIFETIME_HOURS).toBe(24); });
  it('MAX_LOGIN', () => { expect(LIMITS.MAX_LOGIN_ATTEMPTS).toBe(5); });
});

describe('DEFAULTS', () => {
  it('SESSION', () => { expect(DEFAULTS.SESSION_LIFETIME_HOURS).toBe(24); });
  it('AI', () => { expect(DEFAULTS.AI_TIMEOUT_SECONDS).toBe(32); });
});

describe('WebSocketChannel', () => {
  it('Monitoring', () => { expect(WebSocketChannel.Monitoring).toBe('monitoring'); });
  it('System', () => { expect(WebSocketChannel.System).toBe('system'); });
});

describe('PluginCapability', () => {
  it('Collector', () => { expect(PluginCapability.Collector).toBe('collector'); });
  it('Dashboard', () => { expect(PluginCapability.DashboardWidget).toBe('dashboardWidget'); });
});

describe('BackupMode', () => {
  it('Full', () => { expect(BackupMode.Full).toBe('full'); });
  it('Inc', () => { expect(BackupMode.Incremental).toBe('incremental'); });
});

describe('LogLevel', () => {
  it('Trace', () => { expect(LogLevel.Trace).toBe('trace'); });
  it('Error', () => { expect(LogLevel.Error).toBe('error'); });
  it('Critical', () => { expect(LogLevel.Critical).toBe('critical'); });
});

describe('AuditResult', () => {
  it('Success', () => { expect(AuditResult.Success).toBe('success'); });
  it('Failed', () => { expect(AuditResult.Failed).toBe('failed'); });
  it('Blocked', () => { expect(AuditResult.Blocked).toBe('blocked'); });
});

describe('Value Objects', () => {
  it('createEmail valid', () => { expect(createEmail('a@b.com')).toBe('a@b.com'); });
  it('createEmail invalid', () => { expect(() => createEmail('bad')).toThrow(); });
  it('createPercentage', () => { expect(createPercentage(50)).toBe(50); });
  it('createPercentage bounds', () => { expect(createPercentage(0)).toBe(0); expect(createPercentage(100)).toBe(100); });
  it('createPercentage throws', () => { expect(() => createPercentage(-1)).toThrow(); expect(() => createPercentage(101)).toThrow(); });
  it('createNonEmptyString', () => { expect(createNonEmptyString('hi')).toBe('hi'); });
  it('createNonEmptyString throws', () => { expect(() => createNonEmptyString('')).toThrow(); });
});

describe('Result', () => {
  it('success', () => { const r = success('d'); expect(r.success).toBe(true); expect(r.data).toBe('d'); expect(r.error).toBeNull(); });
  it('failure', () => { const e = new Error('f'); const r = failure(e); expect(r.success).toBe(false); expect(r.data).toBeNull(); expect(r.error).toBe(e); });
});

describe('AppError', () => {
  it('create', () => {
    const e = new AppError({ code: 'T', message: 'm', statusCode: 400, severity: 'w', correlationId: 'c1' });
    expect(e.code).toBe('T'); expect(e.message).toBe('m');
  });
  it('defaults', () => {
    expect(new AppError({ code: 'T', message: 'm', statusCode: 500, severity: 'e', correlationId: 'c1' }).details).toBeNull();
  });
  it('stack', () => {
    expect(new AppError({ code: 'E', message: 's', statusCode: 500, severity: 'e', correlationId: 'c1' }).stack).toBeDefined();
  });
});
