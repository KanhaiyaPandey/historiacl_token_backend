export const interpolate = (ts_q, ts_before, price_before, ts_after, price_after) => {
  const ratio = (ts_q - ts_before) / (ts_after - ts_before);
  return price_before + (price_after - price_before) * ratio;
};
