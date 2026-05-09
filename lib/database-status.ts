export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabaseUnavailablePayload() {
  return {
    databaseUnavailable: true,
    message: "Banco de dados não configurado no ambiente local.",
  };
}
