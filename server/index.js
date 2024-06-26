const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'docker-db-1', // Docker Compose'da hizmet adı
  database: 'test',
  password: 'yarmi',
  port: 5432,
});

// Basit bir GET rotası
app.get('/', (req, res) => {
  res.send('Express.js sunucusu çalışıyor');
});

app.get('/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.json(result.rows);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Sunucu hatası');
    }
  });

// Express.js sunucusunda POST rotasını kontrol edin
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND name = $2',
      [email, password]
    );

    if (result.rows.length > 0) {
      // Kullanıcı bulunduğunda başarılı yanıt
      res.json({ message: 'Oturum açıldı', user: result.rows[0] });
    } else {
      // Kullanıcı bulunamadığında hata yanıtı
      res.status(401).json({ error: 'E-posta veya isim hatalı' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


// İsme göre kullanıcı verilerini almak için GET rotası
app.get('/users/email/:email', async (req, res) => {
  const { email } = req.params; // İsim parametresini al
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      // Eğer kullanıcı bulunduysa, bilgileri döndür
      res.json(result.rows);
    } else {
      // Eğer isimle eşleşen kullanıcı yoksa, hata mesajı gönder
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    res.status(500).send('Sunucu hatası');
  }
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Express.js sunucusu port ${PORT} üzerinde çalışıyor`);
});
