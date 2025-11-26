export const STATUS_LABELS = {
  QUERO_ASSISTIR: 'Quero Assistir',
  ASSISTINDO: 'Assistindo',
  ASSISTIDO: 'Assistido'
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;
