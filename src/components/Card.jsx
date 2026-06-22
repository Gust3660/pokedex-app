import { memo } from "react";
import { TYPE_COLORS } from "../constants/pokemon";

const Card = ({ pokemon, onSelect }) => (
  <li className="w-[240px] list-none transition-transform duration-300 hover:scale-105">
    <button
      type="button"
      onClick={() => onSelect(pokemon)}
      className="w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700"
      aria-label={`Ver información de ${pokemon.name}`}
    >
      <div className="relative z-10 mb-[-50px] flex justify-center">
        <img
          src={pokemon.image}
          alt={pokemon.name}
          loading="lazy"
          decoding="async"
          width="170"
          height="170"
          className="h-[170px] w-[170px] object-contain"
        />
      </div>

      <div className="min-h-[170px] rounded-3xl bg-black px-5 pt-[70px] pb-6 text-center text-white shadow-xl">
        <span className="font-bold text-yellow-400">#{pokemon.id}</span>
        <h2 className="mt-2 text-2xl font-bold capitalize">{pokemon.name}</h2>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`${TYPE_COLORS[type] ?? TYPE_COLORS.normal} rounded-full px-3 py-1 text-sm font-bold capitalize`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </button>
  </li>
);

export default memo(Card);
