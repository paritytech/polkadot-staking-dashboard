export interface GenerateNominationsInnerProps {
  setters: Array<any>;
  nominations: string[];
  batchKey: string;
}

export type Nominations = string[];

export interface SetControllerProps {
  section: number;
}

export interface HeaderProps {
  title?: string;
  assistantPage?: string;
  assistantKey?: string;
  complete?: boolean | null;
  thisSection?: any;
}

export interface FooterProps {
  complete: boolean;
}

export interface ChooseNominatorsProps {
  section: number;
}

export interface SummaryProps {
  section: number;
}

export interface PayeeProps {
  section: number;
}

export interface BondProps {
  section: number;
}
