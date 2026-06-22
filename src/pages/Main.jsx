import { useCallback, useEffect, useMemo, useState } from "react";
import { ListPlus } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/Card";
import { getPokemonBatch, getPokemonCatalog } from "../lib/pokeApi";
import InfoPokemon from "./InfoPokemon";

const PAGE_SIZE = 20;

const Main = () => {
  const [catalog, setCatalog] = useState([]);
  const [pokemonByName, setPokemonByName] = useState(() => new Map());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchVisibleCount, setSearchVisibleCount] = useState(PAGE_SIZE);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const mergePokemon = useCallback((pokemons) => {
    setPokemonByName((current) => {
      const updated = new Map(current);
      pokemons.forEach((pokemon) => updated.set(pokemon.name, pokemon));
      return updated;
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getPokemonCatalog(controller.signal)
      .then(async (nextCatalog) => ({
        nextCatalog,
        firstPage: await getPokemonBatch(
          nextCatalog.slice(0, PAGE_SIZE),
          controller.signal,
        ),
      }))
      .then(({ nextCatalog, firstPage }) => {
        setCatalog(nextCatalog);
        mergePokemon(firstPage);
        setLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          toast.error("No fue posible cargar los Pokémon.", { id: "load-error" });
          setError("No fue posible cargar los Pokémon.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [mergePokemon, reloadKey]);

  const normalizedSearch = search.trim().toLowerCase();

  const matchingEntries = useMemo(() => {
    if (!normalizedSearch) return [];
    return catalog.filter(({ name }) => name.includes(normalizedSearch));
  }, [catalog, normalizedSearch]);

  const visibleSearchEntries = useMemo(
    () => matchingEntries.slice(0, searchVisibleCount),
    [matchingEntries, searchVisibleCount],
  );

  useEffect(() => {
    if (!normalizedSearch) return undefined;

    const missingEntries = visibleSearchEntries.filter(
      ({ name }) => !pokemonByName.has(name),
    );

    if (missingEntries.length === 0) return undefined;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      getPokemonBatch(missingEntries, controller.signal)
        .then(mergePokemon)
        .catch((requestError) => {
          if (requestError.name !== "AbortError") {
            console.error(requestError);
            toast.error("No se pudieron completar los resultados de búsqueda.", {
              id: "search-error",
            });
            setError("No se pudieron completar los resultados de búsqueda.");
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [mergePokemon, normalizedSearch, pokemonByName, visibleSearchEntries]);

  const visiblePokemon = useMemo(() => {
    const entries = normalizedSearch
      ? visibleSearchEntries
      : catalog.slice(0, visibleCount);

    return entries
      .map(({ name }) => pokemonByName.get(name))
      .filter(Boolean);
  }, [catalog, normalizedSearch, pokemonByName, visibleCount, visibleSearchEntries]);

  const loadMore = async () => {
    const activeEntries = normalizedSearch ? matchingEntries : catalog;
    const activeCount = normalizedSearch ? searchVisibleCount : visibleCount;
    const nextCount = Math.min(activeCount + PAGE_SIZE, activeEntries.length);
    const nextEntries = activeEntries.slice(activeCount, nextCount);
    const missingEntries = nextEntries.filter(
      ({ name }) => !pokemonByName.has(name),
    );

    setLoadingMore(true);
    setError("");

    try {
      if (missingEntries.length > 0) {
        mergePokemon(await getPokemonBatch(missingEntries));
      }
      if (normalizedSearch) {
        setSearchVisibleCount(nextCount);
      } else {
        setVisibleCount(nextCount);
      }
    } catch (requestError) {
      console.error(requestError);
      toast.error("No se pudieron cargar más Pokémon.", { id: "more-error" });
      setError("No se pudieron cargar más Pokémon. Inténtalo de nuevo.");
    } finally {
      setLoadingMore(false);
    }
  };

  const retry = () => {
    setCatalog([]);
    setPokemonByName(new Map());
    setVisibleCount(PAGE_SIZE);
    setSearchVisibleCount(PAGE_SIZE);
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  if (selectedPokemon) {
    return (
      <InfoPokemon
        pokemon={selectedPokemon}
        onBack={() => setSelectedPokemon(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100">
        <div
          className="h-14 w-14 animate-spin rounded-full border-4 border-gray-300 border-t-red-800"
          role="status"
          aria-label="Cargando Pokémon"
        />
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-5 bg-gray-100 p-5 text-center">
        <p className="text-2xl font-bold text-slate-700">{error}</p>
        <button
          type="button"
          onClick={retry}
          className="rounded-full bg-black px-8 py-3 font-bold text-white transition hover:bg-gray-800"
        >
          Reintentar
        </button>
      </main>
    );
  }

  const searchIsLoading =
    Boolean(normalizedSearch) &&
    visiblePokemon.length < visibleSearchEntries.length;

  const hasMore = normalizedSearch
    ? searchVisibleCount < matchingEntries.length
    : visibleCount < catalog.length;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-100 p-5">
      <div className="mb-10 flex justify-center">
        <input
          type="search"
          placeholder="Buscar Pokémon..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSearchVisibleCount(PAGE_SIZE);
            setError("");
          }}
          className="w-full max-w-md rounded-full border-2 border-black px-5 py-3 text-base font-bold shadow-md outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          aria-label="Buscar Pokémon por nombre"
        />
      </div>

      {error && (
        <p className="mb-6 text-center font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      {normalizedSearch && matchingEntries.length === 0 && (
        <h2 className="text-center text-4xl font-bold text-slate-700">
          No se encontró ningún Pokémon
        </h2>
      )}

      <ul className="m-0 flex list-none flex-wrap justify-center gap-6 p-0">
        {visiblePokemon.map((pokemon) => (
          <Card
            key={pokemon.id}
            pokemon={pokemon}
            onSelect={setSelectedPokemon}
          />
        ))}
      </ul>

      {searchIsLoading && (
        <p className="mt-8 text-center font-semibold text-slate-600" role="status">
          Completando resultados...
        </p>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-full bg-black px-8 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
          >
            <ListPlus size={22} aria-hidden="true" />
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </main>
  );
};

export default Main;
