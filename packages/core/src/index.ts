/** Contratos públicos mínimos do Core. Nenhum módulo deve importar arquivos internos de outro. */
export type WorkspaceKind = "personal" | "professional";

export interface WorkspaceSummary {
  id: string;
  name: string;
  kind: WorkspaceKind;
}
