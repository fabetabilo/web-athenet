/**
 * Mock de equipos
 * 
 * Diccionario temporal estatico para resolver el nombre, emblema y color de un equipo a partir
 * de su ID. Se inyecta en normalizeEvent: ningun componente lo importa. Se utilizan 2 equipos de muestra con logos de placeholder, 
 * los cuales deben ser reemplazados por los reales.
 */

const BASE_URL = import.meta.env.BASE_URL;

const TEAM_A = {
  name: 'Man Blue',
  acronym: 'UPC',
  institution: 'Universidad Playa Chica',
  logo: `${BASE_URL}img/upc-t.png`,
};

const TEAM_B = {
  name: 'Man Red',
  acronym: 'UQ',
  institution: 'Universidad de Quilpué',
  logo: `${BASE_URL}img/uq-t.png`,
};

export const MOCK_TEAMS = {
  101: TEAM_A,
  102: TEAM_B,
  903: TEAM_A,
  904: TEAM_B,
  905: TEAM_A,
  906: TEAM_B,
};

/**
 * Resuelve un equipo por id. Si no existe en el mock, alterna entre los dos de
 * muestra segun la paridad del id: los mocks de eventos siempre enfrentan un id
 * impar contra uno par, asi que el encuentro queda coherente.
 *
 * Incluye el id en la salida porque TeamChip construye la ruta /teams/:id.
 */
export const resolveTeam = (teamId) => ({
  id: teamId,
  ...(MOCK_TEAMS[teamId] ?? (teamId % 2 === 1 ? TEAM_A : TEAM_B)),
});
