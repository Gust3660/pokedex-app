import { LayoutDashboard } from "lucide-react";
import { TYPE_COLORS } from "../constants/pokemon";

const InfoPokemon = ({ pokemon, onBack }) => {
  const primaryColor = TYPE_COLORS[pokemon.types[0]] ?? TYPE_COLORS.normal;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-100 p-4 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-2 rounded-xl border-2 border-red-600 bg-red-600 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-red-600 active:scale-95"
      >
        <LayoutDashboard size={22} aria-hidden="true" />
        Regresar
      </button>

      <article className="mx-auto max-w-5xl rounded-3xl bg-white p-5 shadow-xl sm:p-8">
        <div className="flex flex-col items-center">
          <div
            className={`${primaryColor} mb-8 flex h-64 w-64 items-center justify-center rounded-full shadow-2xl sm:h-80 sm:w-80`}
          >
            <img
              src={pokemon.image}
              alt={pokemon.name}
              width="256"
              height="256"
              className="h-52 w-52 object-contain sm:h-64 sm:w-64"
            />
          </div>

          <h1 className="text-center text-4xl font-bold capitalize sm:text-5xl">
            {pokemon.name}
          </h1>
          <p className="mt-2 text-xl text-gray-500">#{pokemon.id}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`${TYPE_COLORS[type] ?? TYPE_COLORS.normal} rounded-full px-4 py-2 font-bold text-white capitalize`}
              >
                {type}
              </span>
            ))}
          </div>

          <dl className="mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <dt className="font-bold">Altura</dt>
              <dd>{pokemon.height / 10} m</dd>
            </div>
            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <dt className="font-bold">Peso</dt>
              <dd>{pokemon.weight / 10} kg</dd>
            </div>
            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <dt className="font-bold">Experiencia base</dt>
              <dd>{pokemon.baseExperience ?? "No disponible"}</dd>
            </div>
          </dl>

          <section className="mt-10 w-full" aria-labelledby="stats-title">
            <h2 id="stats-title" className="mb-6 text-center text-3xl font-bold">
              Estadísticas
            </h2>

            {pokemon.stats.map((stat) => (
              <div key={stat.name} className="mb-4">
                <div className="mb-1 flex justify-between gap-4">
                  <span className="font-semibold capitalize">{stat.name}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-300">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{ width: `${Math.min(stat.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
      </article>
    </main>
  );
};

export default InfoPokemon;
