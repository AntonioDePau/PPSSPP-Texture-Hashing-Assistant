export default class Encoding{
  static ASCII = {
    GetBytes: (str) => {
      return str.split('').map(c => c.charCodeAt(0));
    }
  }
}