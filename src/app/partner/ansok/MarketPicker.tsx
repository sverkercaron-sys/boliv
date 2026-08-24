"use client";

import { useMemo, useState } from "react";
import { MapPin, Plus, X } from "lucide-react";

export type PartnerMarket = {
  service_slug: string;
  service_name: string;
  municipality_slug: string;
  municipality_name: string;
  county_name: string;
};

export function MarketPicker({ markets }: { markets: PartnerMarket[] }) {
  const [service, setService] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const services = useMemo(
    () => Array.from(new Map(markets.map((market) => [market.service_slug, market.service_name])).entries()),
    [markets],
  );
  const municipalities = useMemo(
    () => markets.filter((market) => market.service_slug === service),
    [markets, service],
  );
  const selectedMarkets = selected
    .map((value) => markets.find((market) => `${market.service_slug}:${market.municipality_slug}` === value))
    .filter((market): market is PartnerMarket => Boolean(market));

  function addMarket() {
    if (!service || !municipality) return;
    const value = `${service}:${municipality}`;
    setSelected((current) => current.includes(value) ? current : [...current, value]);
    setMunicipality("");
  }

  return <div className="market-selector">
    <div className="market-selector-fields">
      <label>Bransch
        <select value={service} onChange={(event) => { setService(event.target.value); setMunicipality(""); }}>
          <option value="">Välj bransch</option>
          {services.map(([slug, name]) => <option value={slug} key={slug}>{name}</option>)}
        </select>
      </label>
      <label>Kommun
        <select value={municipality} onChange={(event) => setMunicipality(event.target.value)} disabled={!service}>
          <option value="">{service ? "Välj kommun" : "Välj bransch först"}</option>
          {municipalities.map((market) => <option value={market.municipality_slug} key={market.municipality_slug}>
            {market.municipality_name} - {market.county_name}
          </option>)}
        </select>
      </label>
      <button className="button market-add-button" type="button" onClick={addMarket} disabled={!service || !municipality}>
        <Plus /> Lägg till
      </button>
    </div>

    {selectedMarkets.length > 0 ? <div className="selected-markets">
      <strong>Valda partnerplatser</strong>
      {selectedMarkets.map((market) => {
        const value = `${market.service_slug}:${market.municipality_slug}`;
        return <div className="selected-market" key={value}>
          <input type="hidden" name="markets" value={value} />
          <MapPin />
          <span><b>{market.service_name}</b><small>{market.municipality_name} - 2 990 kr år 1</small></span>
          <button type="button" aria-label={`Ta bort ${market.service_name} i ${market.municipality_name}`} onClick={() => setSelected((current) => current.filter((item) => item !== value))}><X /></button>
        </div>;
      })}
    </div> : <p className="market-selector-empty">Välj en bransch och kommun ovan. Du kan lägga till flera partnerplatser innan avtalet skapas.</p>}
  </div>;
}

