/**
 * @jest-environment jsdom
 */

import { getCookie, setCookie, deleteCookie } from '../../utils/cookie';

describe('cookie utils', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
  });

  it('setCookie sets a simple cookie', () => {
    setCookie('token', 'abc123');
    expect(document.cookie).toContain('token=abc123');
  });

  it('getCookie retrieves the correct value', () => {
    document.cookie = 'token=abc123';
    const value = getCookie('token');
    expect(value).toBe('abc123');
  });

  it('getCookie returns undefined for missing cookie', () => {
    document.cookie = '';
    const value = getCookie('nonexistent');
    expect(value).toBeUndefined();
  });

  it('setCookie sets a cookie with props (expires)', () => {
    const future = Math.floor(Date.now() / 1000) + 10;
    setCookie('myKey', 'myValue', { expires: future });
    expect(document.cookie).toContain('myKey=myValue');
  });

  it('deleteCookie removes the cookie', () => {
    setCookie('toremove', 'someValue');
    deleteCookie('toremove');
    expect(document.cookie).not.toContain('toremove=someValue');
  });
});
