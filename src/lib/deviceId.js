// Stable device identifier stored in localStorage.
// Not PII, just a random UUID used to link device-only purchases.
export function getOrCreateDeviceId() {
  const KEY = "countdown_device_id";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}
