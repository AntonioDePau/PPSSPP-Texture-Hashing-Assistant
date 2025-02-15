export class LocalStorage{
  static Save = (key, value) => {
    return localStorage.setItem(key, value);
  }

  static Read = (key) => {
    return localStorage.getItem(key) ?? null;
  }
}