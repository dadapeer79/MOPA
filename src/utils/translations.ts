export type Language = 'en' | 'hi' | 'kn';

interface TranslationMap {
  [key: string]: {
    en: string;
    hi: string;
    kn: string;
  };
}

const translations: TranslationMap = {
  'financialHealth': {
    en: 'Financial Health',
    hi: 'वित्तीय स्थिति',
    kn: 'ಆರ್ಥಿಕ ಆರೋಗ್ಯ'
  },
  'revenue': {
    en: 'Revenue',
    hi: 'राजस्व',
    kn: 'ಆದಾಯ'
  },
  'expenses': {
    en: 'Expenses',
    hi: 'खर्च',
    kn: 'ವೆಚ್ಚಗಳು'
  },
  'netProfit': {
    en: 'Net Profit',
    hi: 'शुद्ध लाभ',
    kn: 'ನಿವ್ವಳ ಲಾಭ'
  },
  'strong': {
    en: 'Strong',
    hi: 'मजबूत',
    kn: 'ಬಲವಾದ'
  },
  'stable': {
    en: 'Stable',
    hi: 'स्थिर',
    kn: 'ಸ್ಥಿರ'
  },
  'needsAttention': {
    en: 'Needs attention',
    hi: 'ध्यान देने की आवश्यकता है',
    kn: 'ಗಮನ ಬೇಕಾಗಿದೆ'
  },
  'profitable': {
    en: 'Profitable',
    hi: 'लाभदायक',
    kn: 'ಲಾಭದಾಯಕ'
  },
  'loss': {
    en: 'Loss',
    hi: 'नुकसान',
    kn: 'ನಷ್ಟ'
  },
  'margin': {
    en: 'margin',
    hi: 'मार्जिन',
    kn: 'ಮಾರ್ಜಿನ್'
  },
  'transactions': {
    en: 'transactions',
    hi: 'लेनदेन',
    kn: 'ವ್ಯವಹಾರಗಳು'
  },
  'with': {
    en: 'with',
    hi: 'के साथ',
    kn: 'ಜೊತೆಗೆ'
  },
  'performanceAnalysis': {
    en: 'Performance Analysis',
    hi: 'प्रदर्शन विश्लेषण',
    kn: 'ಕಾರ್ಯಕ್ಷಮತೆ ವಿಶ್ಲೇಷಣೆ'
  },
  'salesPerformance': {
    en: 'Sales Performance',
    hi: 'बिक्री प्रदर्शन',
    kn: 'ಮಾರಾಟ ಕಾರ್ಯಕ್ಷಮತೆ'
  },
  'topPerforming': {
    en: 'Top Performing',
    hi: 'सर्वश्रेष्ठ प्रदर्शन',
    kn: 'ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆ'
  },
  'growthAreas': {
    en: 'Growth Areas',
    hi: 'विकास क्षेत्र',
    kn: 'ಬೆಳವಣಿಗೆ ಕ್ಷೇತ್ರಗಳು'
  },
  'potentialImprovement': {
    en: 'shows potential for improvement',
    hi: 'सुधार की संभावना दिखाता है',
    kn: 'ಸುಧಾರಣೆಯ ಸಾಧ್ಯತೆ ತೋರಿಸುತ್ತದೆ'
  },
  'overallTrend': {
    en: 'Overall Trend',
    hi: 'समग्र प्रवृत्ति',
    kn: 'ಒಟ್ಟಾರೆ ಪ್ರವೃತ್ತಿ'
  },
  'positive': {
    en: 'Positive',
    hi: 'सकारात्मक',
    kn: 'ಧನಾತ್ಮಕ'
  },
  'needsAttentionShort': {
    en: 'Needs attention',
    hi: 'ध्यान दें',
    kn: 'ಗಮನ ಬೇಕು'
  },
  'inventoryAnalysis': {
    en: 'Inventory Analysis',
    hi: 'इन्वेंटरी विश्लेषण',
    kn: 'ದಾಸ್ತಾನು ವಿಶ್ಲೇಷಣೆ'
  },
  'stockLevels': {
    en: 'Stock Levels',
    hi: 'स्टॉक स्तर',
    kn: 'ದಾಸ್ತಾನು ಮಟ್ಟಗಳು'
  },
  'recommendation': {
    en: 'Recommendation',
    hi: 'सिफारिश',
    kn: 'ಶಿಫಾರಸು'
  },
  'impact': {
    en: 'Impact',
    hi: 'प्रभाव',
    kn: 'ಪರಿಣಾಮ'
  },
  'timeframe': {
    en: 'Timeframe',
    hi: 'समय सीमा',
    kn: 'ಕಾಲಮಿತಿ'
  },
  'immediate': {
    en: 'Immediate',
    hi: 'तत्काल',
    kn: 'ತಕ್ಷಣ'
  },
  'shortTerm': {
    en: 'Short-term',
    hi: 'अल्पकालिक',
    kn: 'ಅಲ್ಪಾವಧಿ'
  },
  'longTerm': {
    en: 'Long-term',
    hi: 'दीर्घकालिक',
    kn: 'ದೀರ್ಘಾವಧಿ'
  },
  'high': {
    en: 'High',
    hi: 'उच्च',
    kn: 'ಹೆಚ್ಚು'
  },
  'medium': {
    en: 'Medium',
    hi: 'मध्यम',
    kn: 'ಮಧ್ಯಮ'
  },
  'low': {
    en: 'Low',
    hi: 'कम',
    kn: 'ಕಡಿಮೆ'
  }
};

export function translate(key: string, language: Language): string {
  if (!translations[key]) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translations[key][language] || translations[key].en;
}

export function formatCurrency(amount: number, language: Language): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
  
  const formatted = formatter.format(amount).replace('₹', '').trim();
  return `₹${formatted}`;
}

export function formatPercentage(value: number, language: Language): string {
  return `${value.toFixed(1)}%`;
}