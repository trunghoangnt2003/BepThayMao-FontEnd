import { TestBed } from '@angular/core/testing';
import { CartStore, formatVnd, matchesQuery, searchKey } from './shop-data';
import { checkoutProblems, problemsForStep, stepOf } from './checkout-rules';

describe('formatVnd', () => {
  it('uses vi-VN grouping and a non-breaking space before đ', () => {
    expect(formatVnd(35000)).toBe('35.000\u00a0đ');
  });
});

describe('searchKey', () => {
  it('ignores Vietnamese marks, đ and case so customers can type without accents', () => {
    expect(searchKey('  Xôi   Gà Xé ')).toBe('xoi ga xe');
    expect(searchKey('Xôi đỗ đen')).toBe('xoi do den');
    expect(matchesQuery('Xôi gà xé', 'xoi ga')).toBe(true);
    expect(matchesQuery('Xôi gấc', 'GAC')).toBe(true);
    expect(matchesQuery('Xôi xéo', 'gac')).toBe(false);
    expect(matchesQuery('Xôi xéo', '   ')).toBe(true);
  });
});

describe('CartStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds, clamps to 99, removes at zero and totals by price', () => {
    const cart = TestBed.inject(CartStore);
    const dish = { id: 'd1', name: 'Xôi xéo', price: 25000, category: 'XoiMan' as const };
    cart.set(dish, 2);
    expect(cart.count()).toBe(2);
    expect(cart.total()).toBe(50000);
    cart.set(dish, 150);
    expect(cart.quantityOf('d1')).toBe(99);
    cart.set(dish, 0);
    expect(cart.lines()).toEqual([]);
  });

  it('persists the cart and remembered order phones in sessionStorage', () => {
    const cart = TestBed.inject(CartStore);
    cart.set({ id: 'd1', name: 'Xôi gấc', price: 30000, category: 'XoiNgot' }, 1);
    cart.rememberOrder('BTM7K3F2P', '0901234567');
    expect(JSON.parse(sessionStorage.getItem('btm.cart') ?? '[]')).toHaveLength(1);
    expect(cart.phoneFor('BTM7K3F2P')).toBe('0901234567');
    expect(cart.phoneFor('BTMNOPE00')).toBeNull();
  });
});

describe('checkoutProblems', () => {
  const values = { address: '1 Đường Thử', name: 'Lan', phone: '0901234567', acknowledged: false };
  const open = {
    branchId: 'b1',
    distanceKm: null,
    name: 'Cơ sở Mẫu 1',
    address: 'Số 1',
    openTime: '06:00',
    closeTime: '21:30',
    isOpenNow: true,
    nextDayWarning: false,
    isSuggested: true,
    acceptsOrders: true,
    unavailableDishIds: [] as string[],
  };

  it('passes a complete order at an open branch', () => {
    expect(checkoutProblems(values, open, [])).toEqual([]);
  });

  it('lists problems in field order', () => {
    const problems = checkoutProblems(
      { address: ' ', name: '', phone: '12', acknowledged: false },
      null,
      [],
    );
    expect(problems.map((problem) => problem.id)).toEqual([
      'f-address',
      'branch-first',
      'f-name',
      'f-phone',
    ]);
  });

  it('requires next-day acknowledgement, names sold-out dishes and rejects branches without payment', () => {
    expect(checkoutProblems(values, { ...open, isOpenNow: false }, []).map((p) => p.id)).toEqual([
      'f-ack',
    ]);
    expect(checkoutProblems(values, open, ['Xôi gà xé'])[0]?.message).toContain('Xôi gà xé');
    expect(checkoutProblems(values, { ...open, acceptsOrders: false }, [])[0]?.message).toContain(
      'tạm chưa nhận đơn',
    );
  });
});

describe('checkout steps', () => {
  it('sends recipient problems to step 1 and branch problems to step 2', () => {
    const problems = checkoutProblems(
      { address: '', name: '', phone: '12', acknowledged: false },
      null,
      [],
    );
    expect(problems.map((problem) => stepOf(problem))).toEqual([1, 2, 1, 1]);
    expect(problemsForStep(problems, 1).map((problem) => problem.id)).toEqual([
      'f-address',
      'f-name',
      'f-phone',
    ]);
    expect(problemsForStep(problems, 2).map((problem) => problem.id)).toEqual(['branch-first']);
    expect(problemsForStep(problems, 0)).toEqual([]);
  });
});
