declare namespace API {
  export interface CurrentUser {
    avatar?: string;
    name?: string;
    title?: string;
    group?: string;
    signature?: string;
    tags?: {
      key: string;
      label: string;
    }[];
    userid?: string;
    access?: 'user' | 'guest' | 'admin';
    unreadCount?: number;
  }

  export interface LoginStateType {
    status?: 'ok' | 'error';
    type?: string;
  }

  export interface NoticeIconData {
    avatar?: string | React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    datetime?: React.ReactNode;
    extra?: React.ReactNode;
    style?: React.CSSProperties;
    key?: string | number;
    read?: boolean;
  }
}
