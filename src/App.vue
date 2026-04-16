<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "./composables/useAuth";
import LoginForm from "./domains/auth/components/LoginForm.vue";
import BaseTauriAppBar from "./domains/main/components/BaseTauriAppBar.vue";
import BaseChatContainer from "./domains/main/containers/BaseChatContainer.vue";

const { user, login: authLogin } = useAuth();
const loginLoading = ref(false)

function handleLogin({login, password}: {login: string; password: string}): void {
  loginLoading.value = true;
  authLogin(login, password)
  .finally(() => loginLoading.value = false)
}


</script>

<template>
  <div class="container">
    <BaseTauriAppBar />
    <main class="container">
        <LoginForm v-if="!user" :loading="loginLoading" @submit="handleLogin"/>
        <BaseChatContainer v-else />
    </main>
  </div>

</template>

<style>



</style>

