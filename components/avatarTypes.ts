export type AvatarConfig = {
  skinColor: string;
  hairColor: string;
  eyeColor: string;
  eyebrowColor: string;
  topColor: string;
  bottomColor: string;
  accessoryColor: string;
  height: number;
  bodyWidth: number;
  legLength: number;
  armLength: number;
  headScale: number;
  glossiness: number;
  beard: boolean;
};

export const defaultAvatarConfig: AvatarConfig = {
  skinColor: "#f4d4c2",
  hairColor: "#3b2f2f",
  eyeColor: "#1f2933",
  eyebrowColor: "#36251b",
  topColor: "#5f5ae3",
  bottomColor: "#232946",
  accessoryColor: "#ffd803",
  height: 1,
  bodyWidth: 1,
  legLength: 1,
  armLength: 1,
  headScale: 1,
  glossiness: 0.35,
  beard: false
};
