
export const getCurrencySettings = () => {
  const saved = localStorage.getItem('jastip_currency_settings');
  if (saved) return JSON.parse(saved);
  return {
    code: 'SGD',
    symbol: 'S$',
    manualRate: 13500,
    realtimeRate: 13050,
    updatedAt: new Date().toISOString()
  };
};

export const saveCurrencySettings = (settings: { code: string; manualRate: number }) => {
  const current = getCurrencySettings();
  const newData = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('jastip_currency_settings', JSON.stringify(newData));
};
