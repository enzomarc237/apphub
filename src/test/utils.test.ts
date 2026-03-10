import { describe, it, expect } from 'vitest';
import { formatBytes, getStatusColor, getPlatformLabel } from '@/lib/utils';

describe('formatBytes', () => {
  it('formats bytes to KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });
  it('formats bytes to MB', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });
  it('handles 0', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });
});

describe('getStatusColor', () => {
  it('returns green for success', () => {
    expect(getStatusColor('success')).toContain('green');
  });
  it('returns red for failed', () => {
    expect(getStatusColor('failed')).toContain('red');
  });
});

describe('getPlatformLabel', () => {
  it('returns readable label', () => {
    expect(getPlatformLabel('linux_amd64')).toBe('Linux (x86_64)');
  });
});
