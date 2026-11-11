// Eski iOS (15.0–15.3) Safari/WebView için küçük yamalar. Uygulamanın en başında yüklenir.
for (const C of [Array, String]) {
  if (!C.prototype.at) Object.defineProperty(C.prototype, 'at', { configurable: true, writable: true, value(i) { i = Math.trunc(i) || 0; if (i < 0) i += this.length; return i < 0 || i >= this.length ? undefined : this[i]; } });
}
