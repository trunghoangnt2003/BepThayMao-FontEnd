import { BranchResponse } from '@bepthaymao/api-client';

export function branchFixture(overrides: Partial<BranchResponse> = {}): BranchResponse {
  return {
    id: '019a5dc0-0001-7000-8000-000000000001',
    name: 'Cơ sở Mẫu 1',
    address: 'Số 1 Đường Mẫu',
    lat: 10.7769,
    lng: 106.7009,
    phone: '0901234567',
    isActive: true,
    openTime: '06:00',
    closeTime: '21:30',
    abandonedThresholdMinutes: 10,
    zaloRecipientIds: [],
    bankAccountNo: null,
    bankCode: null,
    sepayAccountRef: null,
    managerIdentifier: 'quanly-1',
    ...overrides,
  };
}
