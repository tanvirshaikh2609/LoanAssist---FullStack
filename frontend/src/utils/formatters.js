export const formatConfidence = (score) => {
  const numScore = Number(score) || 0;
  return Math.round(numScore > 1 ? numScore : numScore * 100);
};
