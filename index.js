const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const db = new sqlite3.Database('./perpustakaan.db', (err) => {
    if (err) {
        console.error('Gagal koneksi ke database:', err.message);
    } else {
        console.log('Terhubung ke database SQLite (perpustakaan.db).');
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS buku (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            judul TEXT NOT NULL,
            kategori TEXT NOT NULL,
            penulis TEXT NOT NULL,
            tahun_terbit INTEGER,
            isbn TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Gagal membuat tabel buku:', err.message);
        } else {
            console.log('Tabel buku berhasil dibuat.');
        }
    });
});


app.post('/buku/tambah', (req, res) => {
    const { judul, kategori, penulis, tahun_terbit, isbn } = req.body;
    const query = 'INSERT INTO buku (judul, kategori, penulis, tahun_terbit, isbn) VALUES (?, ?, ?, ?, ?)';

    db.run(query, [judul, kategori, penulis, tahun_terbit, isbn], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.redirect('/buku/daftar');
    });
});

app.get("/buku/tambah", (req, res) => {
    res.sendFile(__dirname + '/public/tambahbuku.html');
});

app.get("/buku/daftar", (req, res) => {
    res.sendFile(__dirname + '/public/daftarbuku.html');
});

app.get('/buku', (req, res) => {
    db.all('SELECT * FROM buku', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

app.put('/buku/edit/:id', (req, res) => {
    const { id } = req.params;
    const { judul, kategori, penulis, tahun_terbit, isbn } = req.body;
    const query = 'UPDATE buku SET judul = ?, kategori = ?, penulis = ?, tahun_terbit = ?, isbn = ? WHERE id = ?';

    db.run(query, [judul, kategori, penulis, tahun_terbit, isbn, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Buku berhasil diupdate' });
    });
});


app.delete('/buku/hapus/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM buku WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Buku berhasil dihapus' });
    });
});

app.get('/', (req, res) => {
    res.redirect('/buku/daftar');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});