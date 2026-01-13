"use client";

import { useMemo } from "react";
import type { AvatarConfig } from "./avatarTypes";

const toPercent = (value: number, min = 0.6, max = 1.4) => {
  const clamped = Math.min(Math.max(value, min), max);
  return ((clamped - min) / (max - min)) * 100;
};

const fromPercent = (value: number, min = 0.6, max = 1.4) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  return min + (clamped / 100) * (max - min);
};

type ControlPanelProps = {
  config: AvatarConfig;
  onChange: (config: Partial<AvatarConfig>) => void;
  onReset: () => void;
  onRandomize: () => void;
  onExport: () => void;
};

const ControlPanel = ({ config, onChange, onReset, onRandomize, onExport }: ControlPanelProps) => {
  const sliders = useMemo(
    () => [
      {
        key: "height" as const,
        label: "Altura",
        min: 0.7,
        max: 1.3
      },
      {
        key: "bodyWidth" as const,
        label: "Largura do Tronco",
        min: 0.7,
        max: 1.5
      },
      {
        key: "legLength" as const,
        label: "Comprimento das Pernas",
        min: 0.6,
        max: 1.4
      },
      {
        key: "armLength" as const,
        label: "Comprimento dos Braços",
        min: 0.6,
        max: 1.4
      },
      {
        key: "headScale" as const,
        label: "Proporção da Cabeça",
        min: 0.7,
        max: 1.3
      },
      {
        key: "glossiness" as const,
        label: "Brilho da Pele",
        min: 0,
        max: 1
      }
    ],
    []
  );

  return (
    <aside className="control-panel">
      <header>
        <h1>Avatar Forge Studio</h1>
        <p>Personalize qualquer detalhe do seu avatar humano 3D e exporte imediatamente.</p>
      </header>

      <section>
        <h2>Cores base</h2>
        <div className="color-grid">
          {[
            { key: "skinColor" as const, label: "Tom da pele" },
            { key: "hairColor" as const, label: "Cor do cabelo" },
            { key: "eyeColor" as const, label: "Cor dos olhos" },
            { key: "eyebrowColor" as const, label: "Sobrancelhas" },
            { key: "topColor" as const, label: "Blusa" },
            { key: "bottomColor" as const, label: "Calça" },
            { key: "accessoryColor" as const, label: "Acessórios" }
          ].map(({ key, label }) => (
            <label key={key} className="color-field">
              <span>{label}</span>
              <input
                type="color"
                value={config[key]}
                onChange={(event) => onChange({ [key]: event.target.value })}
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2>Proporções</h2>
        <div className="slider-grid">
          {sliders.map(({ key, label, min, max }) => (
            <label key={key} className="slider-field">
              <span>{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={key === "glossiness" ? Math.round(config.glossiness * 100) : Math.round(toPercent(config[key], min, max))}
                onChange={(event) => {
                  const val = Number(event.target.value);
                  if (key === "glossiness") {
                    onChange({ glossiness: val / 100 });
                  } else {
                    onChange({ [key]: fromPercent(val, min, max) });
                  }
                }}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="toggle">
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={config.beard}
            onChange={(event) => onChange({ beard: event.target.checked })}
          />
          <span>Adicionar barba</span>
        </label>
      </section>

      <section className="actions">
        <button type="button" onClick={onRandomize} className="secondary">
          Surpreenda-me
        </button>
        <button type="button" onClick={onReset} className="secondary">
          Restaurar padrão
        </button>
        <button type="button" onClick={onExport} className="primary">
          Exportar imagem 4K
        </button>
      </section>
    </aside>
  );
};

export default ControlPanel;
