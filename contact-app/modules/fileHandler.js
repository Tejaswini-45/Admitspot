const multer = require('multer');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadCSV = upload.single('file');
exports.parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const contacts = [];
    buffer
      .pipe(csvParser())
      .on('data', (row) => contacts.push(row))
      .on('end', () => resolve(contacts))
      .on('error', (error) => reject(error));
  });
};

// Similar function for parsing XLSX files using `xlsx` package
