export function getDeviceId() {
  const key = "countdown_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto && crypto.randomUUID ? crypto.randomUUID() : "")
      || (Math.random().toString(16).slice(2) + Date.now());
    localStorage.setItem(key, id);
  }
  return id;
}
