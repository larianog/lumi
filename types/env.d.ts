declare namespace NodeJS {
  interface ProcessEnv {
    FEITA_AI_API_KEY?: string;
    FEITA_AI_MODEL?: string;
    FEITA_AI_URL?: string;
    LUMI_MATERIAL_RETENTION_HOURS?: string;
    [key: string]: string | undefined;
  }
}

declare const process: NodeJS.Process;
