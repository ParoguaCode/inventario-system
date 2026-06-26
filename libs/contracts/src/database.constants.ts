// ─── Configuración PostgreSQL para pg-inventario (producto + inventario) ───
export const DB_INVENTARIO = {
  HOST: process.env.DB_INVENTARIO_HOST ?? 'localhost',
  PORT: parseInt(process.env.DB_INVENTARIO_PORT ?? '15432', 10),
  DATABASE: process.env.DB_INVENTARIO_NAME ?? 'db_inventario',
  USERNAME: process.env.DB_INVENTARIO_USER ?? 'admin',
  PASSWORD: process.env.DB_INVENTARIO_PASSWORD ?? 'admin123',
};

// ─── Configuración PostgreSQL para pg-reposicion ───
export const DB_REPOSICION = {
  HOST: process.env.DB_REPOSICION_HOST ?? 'localhost',
  PORT: parseInt(process.env.DB_REPOSICION_PORT ?? '15433', 10),
  DATABASE: process.env.DB_REPOSICION_NAME ?? 'db_reposicion',
  USERNAME: process.env.DB_REPOSICION_USER ?? 'admin',
  PASSWORD: process.env.DB_REPOSICION_PASSWORD ?? 'admin123',
};
