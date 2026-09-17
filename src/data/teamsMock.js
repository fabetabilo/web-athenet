/**
 * Mock de equipos
 * 
 * Diccionario temporal estatico para resolver el nombre, emblema y color de un equipo a partir 
 * de su ID. Se utilizan 2 equipos de muestra con logos de placeholder, 
 * los cuales deben ser reemplazados por los reales.
 */

const BASE_URL = import.meta.env.BASE_URL;

const TEAM_A = {
  name: 'MAN BLUE',
  institution: 'Universidad Playa Chica',
  logo: `${BASE_URL}img/upc-t.png`,
};

const TEAM_B = {
  name: 'MAN RED',
  institution: 'Universidad de Quilpué',
  logo: `${BASE_URL}img/uq-t.png`,
};

export const MOCK_TEAMS = {
  903: TEAM_A,
  904: TEAM_B,
  905: TEAM_A,
  906: TEAM_B,
};

/**
 * Helper para obtener un equipo. Si no existe en el mock, 
 * retorna una versión por defecto para no romper la UI.
 */
export const getTeamData = (teamId) => {
  return MOCK_TEAMS[teamId] || {
    name: `EQUIPO ${teamId}`,
    institution: `Institución ${teamId}`,
    logo: `${BASE_URL}img/upc-t.png`,
  };
};
