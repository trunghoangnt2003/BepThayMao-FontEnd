import { AdminSession } from '@bepthaymao/core';

export function roleHome(role: AdminSession['role'] | undefined): string {
  if (role === 'Owner') return '/owner/overview';
  if (role === 'BranchManager') return '/manager/overview';
  return '/login';
}
