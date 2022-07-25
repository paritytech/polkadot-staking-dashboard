export interface ItemProps {
  item: Item;
  actionable: boolean;
}

export interface Item {
  bio: string;
  name: string;
  email: string;
  twitter: string;
  website: string;
  Thumbnail: any;
  validators: any;
}
