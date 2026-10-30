/*Mesajı karşılaştırmaya hazır hale getirir. Kullanıcıların kuralları 
atlatmak için kullandığı hileleri temizler. Mesajın kaydedilen hali değişmez; 
temizlenmiş metin sadece karşılaştırma için kullanılır.*/
const LEET_MAP: Readonly<Record<string, string>> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
};

export function normalizeText(input: string): string {
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/[013457@$]/g, (char) => LEET_MAP[char] ?? char)
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/(\p{L})\1{2,}/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toWords(normalized: string): string[] {
  const words: string[] = [];
  let spelledOut = '';
  for (const token of normalized.split(' ')) {
    if (token.length === 1) {
      spelledOut += token;
      continue;
    }
    if (spelledOut) {
      words.push(spelledOut);
      spelledOut = '';
    }
    if (token) {
      words.push(token);
    }
  }
  if (spelledOut) {
    words.push(spelledOut);
  }
  return words;
}
