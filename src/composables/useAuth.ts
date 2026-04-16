import { Ref, ref } from "vue";
import { User } from "../types";
import { useApi } from "./useApi";
import { useError } from "./useError";


const user: Ref<User | null> = ref(null);

export const useAuth = () => {

    async function login(login: string, password: string) {
        const { login: loginApi } = useApi();
        return loginApi(login, password)
        .then((res) => user.value = res)
        .catch((e) => useError(e))
    }

    async function logout() {
        return Promise.resolve()
    }
    return {
        user,
        login,
        logout
    }
}

