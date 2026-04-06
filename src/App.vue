<script setup lang="ts">
import { onUnmounted, Ref, ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { Message } from "./types";
import MainButton from "./domains/main/components/MainButton.vue";
import DefaultInput from "./domains/main/components/DefaultInput.vue";
import EyeOutline from "./domains/main/icons/EyeOutline.vue";

const greetMsg = ref("");
const name = ref("");

const messages: Ref<Message[]> = ref([]);

const isReceiving = ref(false);
let unlisten: UnlistenFn | null = null;

async function startReceiving() {
  if (isReceiving.value) return;

  try {
    // 1. Запускаем периодическую генерацию сообщений в Rust
    await invoke("start_periodic_messages");

    // 2. Подписываемся на события new-message
    unlisten = await listen<Message>("new-message", (event) => {
      console.log("Новое сообщение от Rust:", event.payload);
      messages.value.push(event.payload);
    });

    isReceiving.value = true;
  } catch (error) {
    console.error("Ошибка запуска получения сообщений:", error);
  }
}

// При размонтировании компонента отписываемся от событий
onUnmounted(() => {
  if (unlisten) {
    unlisten();
    unlisten = null;
  }
});

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsg.value = await invoke("greet", { name: name.value });
}
</script>

<template>
  <main class="container">
    <h1>Welcome to Tauri + Vue</h1>

    <div class="row">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo vite" alt="Vite logo" />
      </a>
      <a href="https://tauri.app" target="_blank">
        <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <p>Click on the Tauri, Vite, and Vue logos to learn more.</p>

    <form class="row" @submit.prevent="greet">
      <DefaultInput id="greet-input" v-model="name" placeholder="Enter a name...">
        <template #append>
          <EyeOutline style="cursor: pointer" />
        </template>
      </DefaultInput>
      <MainButton type="submit">Greet</MainButton>
    </form>
    <p>{{ greetMsg }}</p>
    <div>
      <MainButton @click="startReceiving" :disabled="isReceiving">
        {{ isReceiving ? "Получение..." : "Начать получение сообщений" }}
      </MainButton>
      <div v-if="messages.length">
        <h3>Сообщения:</h3>
        <ul>
          <li v-for="msg in messages" :key="msg.id">
            {{ msg.msg }}
          </li>
        </ul>
      </div>
      <p v-else>Нет сообщений</p>
    </div>
  </main>
</template>

<style scoped>
.row {
  display: flex;
  gap: 8px
}
</style>

