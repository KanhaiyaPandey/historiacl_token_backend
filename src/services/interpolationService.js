export const interpolatePrice = (ts_q, ts_before, price_before, ts_after, price_after) => {
  const ratio = (ts_q - ts_before) / (ts_after - ts_before);
  return price_before + (price_after - price_before) * ratio;
};

export const linearInterpolation = (t0, v0, t1, v1, t) => {
  if (t1 === t0) return v0;
  return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
};
