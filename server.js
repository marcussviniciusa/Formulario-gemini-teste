const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432
});

// Iniciar banco de dados
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS formularios (
        id SERIAL PRIMARY KEY,
        assistantName VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        targetAudience VARCHAR(255) NOT NULL,
        personality TEXT NOT NULL,
        achievements TEXT NOT NULL,
        products TEXT NOT NULL,
        initialQuestion VARCHAR(255) NOT NULL,
        painPoints TEXT NOT NULL,
        solutions TEXT NOT NULL,
        differentials TEXT NOT NULL,
        purchaseProcess TEXT NOT NULL,
        objections TEXT NOT NULL,
        purchaseLinks VARCHAR(255) NOT NULL,
        urgency TEXT NOT NULL,
        paymentMethods TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela criada com sucesso ou já existente');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
}

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para página de visualização de dados
app.get('/dados', (req, res) => {
  res.sendFile(path.join(__dirname, 'dados.html'));
});

// API para obter todos os dados
app.get('/api/dados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM formularios ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados do banco de dados.' });
  }
});

// Rota para salvar formulário
app.post('/api/submit-form', async (req, res) => {
  try {
    const {
      assistantName,
      specialization,
      targetAudience,
      personality,
      achievements,
      products,
      initialQuestion,
      painPoints,
      solutions,
      differentials,
      purchaseProcess,
      objections,
      purchaseLinks,
      urgency,
      paymentMethods
    } = req.body;

    const result = await pool.query(
      `INSERT INTO formularios (
        assistantName, specialization, targetAudience, personality, 
        achievements, products, initialQuestion, painPoints, 
        solutions, differentials, purchaseProcess, objections, 
        purchaseLinks, urgency, paymentMethods
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
      [
        assistantName, specialization, targetAudience, personality,
        achievements, products, initialQuestion, painPoints,
        solutions, differentials, purchaseProcess, objections,
        purchaseLinks, urgency, paymentMethods
      ]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Formulário enviado com sucesso!',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Erro ao salvar no banco de dados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar o formulário. Por favor, tente novamente.' 
    });
  }
});

// Iniciar servidor
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
});
