import { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    queued: 'bg-blue-100 text-blue-800',
    running: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    linux_amd64: 'Linux (x86_64)',
    linux_arm64: 'Linux (ARM64)',
    windows_amd64: 'Windows (x86_64)',
    macos_amd64: 'macOS (Intel)',
    macos_arm64: 'macOS (Apple Silicon)',
  };
  return labels[platform] || platform;
}
