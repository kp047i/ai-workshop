const ngWords = [
  '殺',
  '死',
  '暴力',
  'violence',
  'kill',
  'death',
  'nude',
  'sex',
  'porn',
  '裸',
  '性的',
  'トヨタ',
  'ソニー',
  'アップル',
  'マクドナルド',
  'coca-cola',
  'nike',
];

export function checkSafety(text: string): { safe: boolean; message?: string } {
  const lowerText = text.toLowerCase();
  
  for (const word of ngWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return {
        safe: false,
        message: '不適切な内容が含まれている可能性があります。別の表現で試してください。'
      };
    }
  }

  return { safe: true };
}