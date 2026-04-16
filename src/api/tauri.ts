import { Api, Chat, Message } from "../types";
import { User } from "../types";

export const tauri: Api = {
    login: async (login, password) => getApi().login(login, password),
    getUser: async () => getApi().getUser(),
    getChats: async () => getApi().getChats(),
    getChat: async (id) => getApi().getChat(id),
    sendMessage: async (id, msg) => getApi().sendMessage(id, msg)
}

function getApi(): Api {
  return mockApi;
}

const mockApi: Api = {
    login: async (): Promise<User> => ({
            id: 1,
            login: 'Stiven'
    }),
    getUser: async (): Promise<User> => ({
            id: 1,
            login: 'Stiven'
    }),
    getChats: async (): Promise<Chat[]> => ([
        {
            id,
            login: 'StaticRange',
            has_unread: true,
        },
        {
            id: 2,
            login: 'StaticRange',
            has_unread: true,
        },
        {
            id: 3,
            login: 'StaticRange',
            has_unread: false,
        },
    ]),
    getChat: async (): Promise<Message[]> => ([
        {
            id: 1,
            msg: 'Hi there',
            date: '07:02:2023 20:30'
        },
        {
            id: 2,
            msg: 'STRrrrrrr',
            date: '07:02:2023 20:30'
        },
        {
            id: 3,
            msg: 'Hey hey hey you are',
            date: '07:02:2023 20:30'
        },
    ]),
    sendMessage: async () => ({
            id: 4,
            msg: '-|-_-|-/',
            date: '07:02:2023 20:30'
        })
}


