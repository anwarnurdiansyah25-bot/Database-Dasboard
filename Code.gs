/**
 * Dashboard Data Siswa MA Sabilunnajah 2026/2027
 * 1. Isi SPREADSHEET_ID dengan ID Google Spreadsheet sumber data.
 * 2. Pastikan nama sheet sesuai dengan SHEET_NAME.
 * 3. Deploy sebagai Web App, Execute as: Me; akses sesuai kebijakan sekolah.
 */
const SPREADSHEET_ID = 'GANTI_DENGAN_ID_SPREADSHEET_ANDA';
const SHEET_NAME = 'Data Gabungan';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Data Siswa MA Sabilunnajah 2026/2027')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getStudentData() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'GANTI_DENGAN_ID_SPREADSHEET_ANDA') {
    throw new Error('Silakan isi SPREADSHEET_ID pada Code.gs terlebih dahulu.');
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan.');
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const idx = name => headers.indexOf(name.toLowerCase());
  const col = {
    tingkat: idx('Tingkat'), nama: idx('Nama Lengkap'), nisn: idx('NISN'),
    kelas: idx('Tingkat - Rombel'), status: idx('Status'),
    jk: idx('Jenis Kelamin'), alamat: idx('Alamat'),
    tempatLahir: idx('Tempat Lahir'), tanggalLahir: idx('Tanggal Lahir')
  };
  ['tingkat','nama','nisn','kelas','status','jk','alamat'].forEach(k => {
    if (col[k] < 0) throw new Error('Kolom wajib tidak ditemukan: ' + k + '. Periksa judul kolom pada baris pertama.');
  });
  return values.slice(1).filter(row => row[col.nama] && row[col.nama].trim()).map(row => ({
    nama: cell(row, col.nama),
    nisn: cell(row, col.nisn),
    tingkat: cell(row, col.tingkat),
    kelas: cell(row, col.kelas),
    jk: normalizeGender(cell(row, col.jk)),
    status: cell(row, col.status),
    alamat: cell(row, col.alamat),
    tempatLahir: col.tempatLahir >= 0 ? cell(row, col.tempatLahir) : '',
    tanggalLahir: col.tanggalLahir >= 0 ? cell(row, col.tanggalLahir) : ''
  }));
}

function cell(row, index) {
  return index >= 0 && row[index] != null ? String(row[index]).trim() : '';
}

function normalizeGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'laki-laki' || v === 'laki laki' || v === 'l') return 'Laki-laki';
  if (v === 'perempuan' || v === 'p') return 'Perempuan';
  return value || 'Tidak diketahui';
}
