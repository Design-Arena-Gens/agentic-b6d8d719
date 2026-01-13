"use client";

import { useCallback, useRef, useState } from "react";
import AvatarCanvas, { type AvatarCanvasHandle } from "./AvatarCanvas";
import ControlPanel from "./ControlPanel";
import { defaultAvatarConfig, type AvatarConfig } from "./avatarTypes";

const randomColor = () => `#${Math.floor(Math.random() * 0xffffff)
  .toString(16)
  .padStart(6, "0")}`;

const randomSkinTone = () => {
  const tones = ["#f8d9c4", "#dab49d", "#b48a76", "#8a5a44", "#593327", "#3d2215"];
  return tones[Math.floor(Math.random() * tones.length)];
};

const randomHairColor = () => {
  const tones = ["#0f0e0f", "#2d2019", "#4c3623", "#6d4c3d", "#a1674a", "#c98f4c", "#d1a960", "#1f1214"];
  return tones[Math.floor(Math.random() * tones.length)];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const AvatarStudio = () => {
  const [config, setConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const canvasRef = useRef<AvatarCanvasHandle>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2600);
  }, []);

  const handleChange = useCallback((partial: Partial<AvatarConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(defaultAvatarConfig);
    showFeedback("Avatar restaurado para o modelo base.");
  }, [showFeedback]);

  const handleRandomize = useCallback(() => {
    const next: AvatarConfig = {
      ...defaultAvatarConfig,
      skinColor: randomSkinTone(),
      hairColor: randomHairColor(),
      eyeColor: randomColor(),
      eyebrowColor: randomHairColor(),
      topColor: randomColor(),
      bottomColor: randomColor(),
      accessoryColor: randomColor(),
      beard: Math.random() > 0.5,
      height: clamp(defaultAvatarConfig.height + (Math.random() - 0.5) * 0.6, 0.7, 1.3),
      bodyWidth: clamp(defaultAvatarConfig.bodyWidth + (Math.random() - 0.5) * 0.9, 0.7, 1.5),
      legLength: clamp(defaultAvatarConfig.legLength + (Math.random() - 0.5) * 0.8, 0.6, 1.4),
      armLength: clamp(defaultAvatarConfig.armLength + (Math.random() - 0.5) * 0.8, 0.6, 1.4),
      headScale: clamp(defaultAvatarConfig.headScale + (Math.random() - 0.5) * 0.5, 0.7, 1.3),
      glossiness: Math.random() * 0.8
    };
    setConfig(next);
    showFeedback("Novo avatar gerado com sucesso!");
  }, [showFeedback]);

  const handleExport = useCallback(() => {
    const dataUrl = canvasRef.current?.capture();
    if (!dataUrl) {
      showFeedback("Não foi possível exportar. Tente novamente.");
      return;
    }
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `avatar-${Date.now()}.png`;
    link.click();
    showFeedback("Imagem 4K do avatar exportada!");
  }, [showFeedback]);

  return (
    <main className="studio">
      <ControlPanel
        config={config}
        onChange={handleChange}
        onReset={handleReset}
        onRandomize={handleRandomize}
        onExport={handleExport}
      />
      <section className="viewport">
        <div className="canvas-wrap">
          <div className="gradient" />
          <AvatarCanvas ref={canvasRef} config={config} />
        </div>
        <div className="insight">
          <h2>Pipeline de realismo</h2>
          <p>
            Renderização PBR em tempo real com iluminação de estúdio e sombras suaves. Ajuste anatomia, materiais e acessórios e exporte para fluxos profissionais de produção.
          </p>
          <ul>
            <li>Modelagem paramétrica humana otimizada.</li>
            <li>Controle preciso de tons de pele, cabelo e roupa.</li>
            <li>Exportação em PNG transparente e base 4K.</li>
            <li>Engine WebGL compatível com qualquer navegador moderno.</li>
          </ul>
        </div>
      </section>
      {feedback && <div className="feedback">{feedback}</div>}
    </main>
  );
};

export default AvatarStudio;
