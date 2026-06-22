const API_URL = "https://pokeapi.co/api/v2";
const MAX_RETRIES = 2;

const wait = (milliseconds) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));

const getJson = async (url, signal) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let response;

    try {
      response = await fetch(url, { signal });
    } catch (error) {
      if (error.name === "AbortError" || attempt === MAX_RETRIES) throw error;
      await wait(300 * 2 ** attempt);
      continue;
    }

    if (response.ok) return response.json();

    const canRetry = response.status === 429 || response.status >= 500;
    if (!canRetry || attempt === MAX_RETRIES) {
      throw new Error(`PokéAPI respondió con estado ${response.status}`);
    }

    await wait(300 * 2 ** attempt);
  }

  throw new Error("No fue posible conectar con PokéAPI");
};

const normalizePokemon = (pokemon) => ({
  id: pokemon.id,
  name: pokemon.name,
  image:
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default,
  types: pokemon.types.map(({ type }) => type.name),
  stats: pokemon.stats.map(({ base_stat: value, stat }) => ({
    name: stat.name,
    value,
  })),
  height: pokemon.height,
  weight: pokemon.weight,
  baseExperience: pokemon.base_experience,
});

export const getPokemonCatalog = async (signal) => {
  const { count } = await getJson(`${API_URL}/pokemon?limit=1`, signal);
  const data = await getJson(`${API_URL}/pokemon?limit=${count}`, signal);
  return data.results;
};

export const getPokemonBatch = async (entries, signal, concurrency = 8) => {
  const results = new Array(entries.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < entries.length) {
      const index = nextIndex++;
      results[index] = normalizePokemon(await getJson(entries[index].url, signal));
    }
  };

  const workerCount = Math.min(concurrency, entries.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
};
