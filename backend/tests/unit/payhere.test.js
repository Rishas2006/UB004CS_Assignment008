const { md5, checkoutHash, verifyNotify, statusFromCode, fmt } = require('../../src/services/payhere');

describe('PayHere signatures', () => {
  const secret = 'sandbox-secret'; const merchant = '1211149';
  test('amount is always formatted with two decimals', () => { expect(fmt(1000)).toBe('1000.00'); expect(fmt('3500.5')).toBe('3500.50'); });
  test('checkout hash is deterministic and upper-case md5', () => {
    const h = checkoutHash({ merchantId: merchant, orderId: 'INV-1', amount: 3500, secret });
    expect(h).toBe(checkoutHash({ merchantId: merchant, orderId: 'INV-1', amount: 3500, secret }));
    expect(h).toMatch(/^[0-9A-F]{32}$/);
  });
  test('changing the amount changes the hash (tamper detection)', () => {
    expect(checkoutHash({ merchantId: merchant, orderId: 'INV-1', amount: 3500, secret })).not.toBe(checkoutHash({ merchantId: merchant, orderId: 'INV-1', amount: 1, secret }));
  });
  const body = () => {
    const b = { merchant_id: merchant, order_id: 'INV-1', payhere_amount: '3500.00', payhere_currency: 'LKR', status_code: '2' };
    b.md5sig = md5(`${merchant}INV-13500.00LKR2${md5(secret)}`); return b;
  };
  test('accepts a correctly signed notification', () => { expect(verifyNotify(body(), secret, merchant)).toBe(true); });
  test('rejects a forged amount', () => { expect(verifyNotify({ ...body(), payhere_amount: '1.00' }, secret, merchant)).toBe(false); });
  test('rejects a wrong merchant id and missing signature', () => {
    expect(verifyNotify({ ...body(), merchant_id: '999' }, secret, merchant)).toBe(false);
    expect(verifyNotify({ ...body(), md5sig: undefined }, secret, merchant)).toBe(false);
  });
  test('maps gateway status codes', () => {
    expect(statusFromCode(2)).toBe('SUCCESS'); expect(statusFromCode(0)).toBe('PENDING');
    expect(statusFromCode(-1)).toBe('CANCELLED'); expect(statusFromCode(-2)).toBe('FAILED'); expect(statusFromCode(-3)).toBe('CHARGEBACK');
  });
});
