export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (
  dateStr: string | null | undefined,
  emptyPlaceholder: string = '-'
): string => {
  if (!dateStr) return emptyPlaceholder;
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export const formatDateTime = (
  dateStr: string | null | undefined,
  emptyPlaceholder: string = '-'
): string => {
  if (!dateStr) return emptyPlaceholder;
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const DIGIT_WORDS = ['khong', 'mot', 'hai', 'ba', 'bon', 'nam', 'sau', 'bay', 'tam', 'chin'];
const SCALE_WORDS = ['', 'nghin', 'trieu', 'ty', 'nghin ty', 'trieu ty'];

const normalizeVietnameseWords = (value: string): string =>
  value
    .replace(/\bkhong tram\b/g, 'khong tram')
    .replace(/\bmot muoi\b/g, 'muoi')
    .replace(/\bmuoi nam\b/g, 'muoi lam')
    .replace(/\bmuoi bon\b/g, 'muoi tu')
    .replace(/\bhai muoi mot\b/g, 'hai muoi mot')
    .replace(/\bba muoi mot\b/g, 'ba muoi mot')
    .replace(/\bbon muoi mot\b/g, 'bon muoi mot')
    .replace(/\bnam muoi mot\b/g, 'nam muoi mot')
    .replace(/\bsau muoi mot\b/g, 'sau muoi mot')
    .replace(/\bbay muoi mot\b/g, 'bay muoi mot')
    .replace(/\btam muoi mot\b/g, 'tam muoi mot')
    .replace(/\bchin muoi mot\b/g, 'chin muoi mot')
    .replace(/\bmot\b(?=\s+moi|\s+tram|\s+nghin|\s+trieu|\s+ty|\s*$)/g, 'mot')
    .replace(/\bbon\b(?=\s*$)/g, 'tu')
    .replace(/\bnam\b(?=\s*$)/g, 'lam')
    .replace(/\s+/g, ' ')
    .trim();

const addVietnameseAccents = (value: string): string => {
  const replacements: Record<string, string> = {
    khong: 'khong',
    mot: 'mot',
    hai: 'hai',
    ba: 'ba',
    bon: 'bon',
    nam: 'nam',
    sau: 'sau',
    bay: 'bay',
    tam: 'tam',
    chin: 'chin',
    muoi: 'muoi',
    tram: 'tram',
    nghin: 'nghin',
    trieu: 'trieu',
    ty: 'ty',
    le: 'le',
    lam: 'lam',
    tu: 'tu',
  };

  return value
    .split(' ')
    .map((word) => replacements[word] || word)
    .join(' ')
    .replace(/\bkhong\b/g, 'không')
    .replace(/\bmot\b/g, 'một')
    .replace(/\bhai\b/g, 'hai')
    .replace(/\bba\b/g, 'ba')
    .replace(/\bbon\b/g, 'bốn')
    .replace(/\bnam\b/g, 'năm')
    .replace(/\bsau\b/g, 'sáu')
    .replace(/\bbay\b/g, 'bảy')
    .replace(/\btam\b/g, 'tám')
    .replace(/\bchin\b/g, 'chín')
    .replace(/\bmuoi\b/g, 'mươi')
    .replace(/\btram\b/g, 'trăm')
    .replace(/\bnghin\b/g, 'nghìn')
    .replace(/\btrieu\b/g, 'triệu')
    .replace(/\bty\b/g, 'tỷ')
    .replace(/\ble\b/g, 'lẻ')
    .replace(/\blam\b/g, 'lăm')
    .replace(/\btu\b/g, 'tư');
};

const readThreeDigits = (value: number, hasHigherGroup: boolean): string => {
  const hundreds = Math.floor(value / 100);
  const tensUnits = value % 100;
  const tens = Math.floor(tensUnits / 10);
  const units = tensUnits % 10;
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(DIGIT_WORDS[hundreds], 'tram');
  } else if (hasHigherGroup && tensUnits > 0) {
    parts.push('khong', 'tram');
  }

  if (tens > 1) {
    parts.push(DIGIT_WORDS[tens], 'muoi');
    if (units === 1) {
      parts.push('mot');
    } else if (units === 4) {
      parts.push('tu');
    } else if (units === 5) {
      parts.push('lam');
    } else if (units > 0) {
      parts.push(DIGIT_WORDS[units]);
    }
  } else if (tens === 1) {
    parts.push('muoi');
    if (units === 5) {
      parts.push('lam');
    } else if (units > 0) {
      parts.push(DIGIT_WORDS[units]);
    }
  } else if (units > 0) {
    if (hundreds > 0 || hasHigherGroup) {
      parts.push('le');
    }
    parts.push(DIGIT_WORDS[units]);
  }

  return parts.join(' ').trim();
};

export const numberToVietnameseCurrencyWords = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';

  const roundedAmount = Math.round(amount);

  if (roundedAmount === 0) {
    return 'Không đồng';
  }

  if (roundedAmount < 0) {
    return '';
  }

  const groups: number[] = [];
  let remaining = roundedAmount;

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const segments: string[] = [];

  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const groupValue = groups[index];

    if (groupValue === 0) continue;

    const groupWords = readThreeDigits(groupValue, index < groups.length - 1);
    const scaleWord = SCALE_WORDS[index] || '';
    segments.push([groupWords, scaleWord].filter(Boolean).join(' '));
  }

  const normalized = normalizeVietnameseWords(segments.join(' '));
  const accented = addVietnameseAccents(normalized);

  return `${accented.charAt(0).toUpperCase()}${accented.slice(1)} đồng`;
};
