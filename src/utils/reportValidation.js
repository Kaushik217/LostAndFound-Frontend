export const MIN_DESCRIPTION_LENGTH = 10;

export const validateDescription = (value) => {
  if (!value.trim()) return 'Description is required.';
  if (value.trim().length < MIN_DESCRIPTION_LENGTH) {
    return `Description must contain at least ${MIN_DESCRIPTION_LENGTH} characters.`;
  }
  return '';
};

const messages = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((message) => typeof message === 'string' && message.trim());

export const getReportApiErrors = (data) => {
  const entries = data?.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
    ? Object.entries(data.errors)
    : [];
  const description = entries
    .filter(([key]) => key.split('.').pop().toLowerCase() === 'description')
    .flatMap(([, value]) => messages(value))
    .join(' ');
  const otherErrors = entries
    .filter(([key]) => key.split('.').pop().toLowerCase() !== 'description')
    .flatMap(([, value]) => messages(value));
  const general = otherErrors.join(' ') || (description ? '' :
    messages(data?.message)[0] || messages(data?.detail)[0] ||
    messages(data?.errors).join(' ') || messages(data?.title)[0] ||
    messages(data)[0] || 'Failed to submit report. Please try again.');
  return { description, general };
};
