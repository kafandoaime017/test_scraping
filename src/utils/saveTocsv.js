const fs = require('fs');
const escapeApostrophes = (str) => str.replace(/'/g, "\\'");

saveToCsv = (data, fileName) => {
  const header = Object.keys(data[0]).join(','); 
  const rows = data.map(row => 
    Object.values(row).map(value => `"${escapeApostrophes(value)}"`).join(',')
  ).join('\n');

  const csvContent = `${header}\n${rows}`;

  const folderPath = './data';
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const filePath = `./data/${fileName}`;
  fs.writeFileSync(filePath, csvContent);
};

module.exports = saveToCsv;