import { AdminSession } from '@bepthaymao/core';

export function roleHome(role: AdminSession['role'] | undefined): string {
  if (role === 'Owner') return '/owner/branches';
  if (role === 'BranchManager') return '/manager/settings';
  return '/login';
}
