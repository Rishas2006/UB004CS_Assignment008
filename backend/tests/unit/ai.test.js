jest.mock('../../src/config', () => ({ ai: { key: '', model: 'x' } }), { virtual: false });
const { hasRedFlag } = require('../../src/services/ai');

describe('AI red-flag screening (runs before any AI call)', () => {
  test.each([['I have chest pain since morning'], ['he is unconscious'], ['මට පපුවේ වේදනාවක් තියෙනවා'], ['நெஞ்சு வலி இருக்கிறது'], ['thinking of suicide']])('flags "%s"', (t) => { expect(hasRedFlag(t)).toBe(true); });
  test.each([['How do I book a cardiology appointment?'], ['What are your pharmacy hours?']])('does not flag "%s"', (t) => { expect(hasRedFlag(t)).toBe(false); });
});
