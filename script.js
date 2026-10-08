const tableBody = document.querySelector('#tableBody');
const searchInput = document.querySelector('#searchInput');
const seriesFilter = document.querySelector('#seriesFilter');
const typeFilter = document.querySelector('#typeFilter');
const resultCount = document.querySelector('#resultCount');

let nerfData = [];

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(',');

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    const row = {};

    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || '').trim();
    });

    return row;
  });
}

function populateFilters(rows) {
  const uniqueSeries = [...new Set(rows.map((row) => row.series).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(rows.map((row) => row.type).filter(Boolean))].sort();

  uniqueSeries.forEach((series) => {
    const option = document.createElement('option');
    option.value = series;
    option.textContent = series;
    seriesFilter.appendChild(option);
  });

  uniqueTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

function getFilteredRows() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedSeries = seriesFilter.value;
  const selectedType = typeFilter.value;

  return nerfData.filter((row) => {
    const matchesSearch =
      !searchTerm ||
      [row.name, row.series, row.type]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm);

    const matchesSeries = selectedSeries === 'all' || row.series === selectedSeries;
    const matchesType = selectedType === 'all' || row.type === selectedType;

    return matchesSearch && matchesSeries && matchesType;
  });
}

function renderRows(rows) {
  tableBody.innerHTML = '';

  rows.forEach((row) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.series}</td>
      <td>${row.type}</td>
      <td>${row.year}</td>
    `;

    tableBody.appendChild(tr);
  });

  resultCount.textContent = `${rows.length} blaster${rows.length === 1 ? '' : 's'} found`;

  if (rows.length === 0) {
    const empty = document.createElement('tr');
    empty.innerHTML = '<td colspan="4">No blasters match your search.</td>';
    tableBody.appendChild(empty);
  }
}

function applyFilters() {
  renderRows(getFilteredRows());
}

fetch('data/nerf_guns.csv')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Could not load data');
    }
    return response.text();
  })
  .then((csvText) => {
    nerfData = parseCSV(csvText);
    populateFilters(nerfData);
    renderRows(nerfData);
  })
  .catch((error) => {
    resultCount.textContent = 'Unable to load the Nerf gun database.';
    tableBody.innerHTML = `
      <tr>
        <td colspan="4">There was an error loading the data. Please refresh the page.</td>
      </tr>
    `;
    console.error(error);
  });

searchInput.addEventListener('input', applyFilters);
seriesFilter.addEventListener('change', applyFilters);
typeFilter.addEventListener('change', applyFilters);
