// data.js: every number the site uses, each with its source. Estimates are labeled.
// Keep this the single source of truth; cite entries in the page with <span class="cite" data-src="id">.
const val = (value, units, sourceId, estimate = false, note = '') => ({ value, units, sourceId, estimate, note });

export const DATA = {
  sources: {
    'example-source': { citation: 'Author, Title, Publisher (Year). Replace with a real source.', url: '', accessed: 'YYYY-MM-DD' },
    estimate: { citation: 'ESTIMATE: engineering value chosen by the project, not yet tied to a primary source.', url: '', accessed: '' },
  },
  example: {
    K: val(1.5, 'output per input', 'example-source'),
    tau: val(5, 'min', 'example-source'),
    theta: val(2, 'min', 'estimate', true, 'Example dead time; replace with a sourced value.'),
  },
};
