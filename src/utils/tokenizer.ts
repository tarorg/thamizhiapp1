export function encode(text: string): number[] {
  // This is a placeholder implementation
  // You should use a proper tokenizer library here
  return text.split('').map(char => char.charCodeAt(0));
}