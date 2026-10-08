import React, { useEffect, useState } from "react";
import { AuthorityMapService } from "../../../services/smartMap/repository";
export function AuthorityMapIntelligence() {
  const [data, setData] = useState(() => AuthorityMapService.snapshot());
  useEffect(() => {
    const update = () => setData(AuthorityMapService.snapshot());
    window.addEventListener("yatra-map-data", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("yatra-map-data", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-5 mb-5">
      <p className="text-xs uppercase tracking-widest text-stone-500">
        Safety Map · demo integration
      </p>
      <h2 className="text-xl font-bold my-2">Community reports & assistance</h2>
      <p className="text-sm text-stone-500">
        Aggregated reports only. No tourist movement history is collected.
        Footfall data is not connected.
      </p>
      <div className="flex flex-wrap gap-3 my-4">
        {Object.entries(data.categories).map(([category, count]) => (
          <span className="bg-stone-100 rounded-lg p-2 text-xs" key={category}>
            {category}: {count}
          </span>
        ))}
      </div>
      <h3 className="font-bold">
        Simulated SOS requests ({data.requests.length})
      </h3>
      <p className="text-xs text-stone-500">
        No emergency service has been contacted.
      </p>
      {data.requests.map((r) => (
        <article className="border-t py-3 mt-3" key={r.id}>
          <b>{r.category}</b>
          <p className="text-sm">
            {r.location} · {new Date(r.timestamp).toLocaleString()}
          </p>
          <small>
            {r.status} · {r.id}
          </small>
          {r.coordinates && (
            <p className="text-xs">
              User-shared assistance location: {r.coordinates.lat.toFixed(5)},{" "}
              {r.coordinates.lng.toFixed(5)}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
