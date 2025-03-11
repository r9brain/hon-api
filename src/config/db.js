import pg from 'pg';
const {Pool} = pg;
import { config } from 'dotenv';


config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false   
  }
};

export const pool = new Pool(poolConfig);

// Función para verificar la conexión
export const checkDBConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos');
    client.release();
    
    // Verificar conexión cada 5 minutos
    setInterval(async () => {
      try {
        await pool.query('SELECT 1');
      } catch (error) {
        console.error('❌ Error en conexión periódica:', error.message);
      }
    }, 300000);
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error.message);
    process.exit(1); // Salir de la aplicación si no hay conexión
  }
};

// Manejadores de eventos para la conexión
pool.on('connect', () => {
  console.log('Nueva conexión establecida con la base de datos');
});

pool.on('error', (err) => {
  console.error('Error inesperado en la conexión:', err.message);
});