export type Message = {
    id: number;
    msg: string;
    date: string;
}

export type User = {
    id: number;
    login: string;
}

export type Chat = {
        id: number;
        login: string;
        has_unread: boolean;
    }[];

export type Api = {
    getUser: () => Promise<User>;
    login: (login: string, password: string) => Promise<User>;
    getChats: () => Promise<Chat[]>;
    getChat: (id: number) => Promise<Message[]>
    sendMessage: (id: number, msg: string) => Promise<Message>
}