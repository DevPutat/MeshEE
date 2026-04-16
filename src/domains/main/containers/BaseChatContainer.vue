<template>
  <div class="app-layout">
    <header class="app-bar">Мой апп-бар</header>
    <div class="main-container">
      <aside 
        class="chats-list"
        :class="{ 'mobile-hidden': isMobile && mobileView !== 'chats' }"
      >
        <ChatsList @select-chat="selectChat" />
      </aside>

      <main 
        class="room-content"
        :class="{ 'mobile-hidden': isMobile && mobileView !== 'room' }"
      >
        <button v-if="isMobile && mobileView === 'room'" @click="goBackToChats">
          ← Назад
        </button>
        <RoomContent />
        <footer v-if="isDesktop || mobileView === 'room'" class="app-footer">
      Мой футер (навигация)
    </footer>
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import { useBreakpoints } from '../../../composables/useBreakpoints';
import { Chat } from '../../../types';


const {
    isDesktop,
    isMobile
} = useBreakpoints();

const mobileView: Ref<'room' | 'chats'> = ref('chats');
const selectedChat: Ref<Chat | null> = ref(null);

    function goBackToChats() {
        mobileView.value = 'chats';
    }

    function selectChat(chat: Chat) {
        selectedChat.value = chat;
        mobileView.value = 'room'
    }

</script>

<style scoped>
/* Десктопная раскладка */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chats-list {
  width: 300px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.room-content {
  flex: 1;
  overflow-y: auto;
}

/* Мобильная раскладка */
@media (max-width: 768px) {
  .main-container {
    position: relative;
  }

  .chats-list,
  .room-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }

  /* Скрываем неактивный блок */
  .mobile-hidden {
    transform: translateX(-100%);
    pointer-events: none;
  }

  /* Альтернатива – display: none, но тогда нет анимации */
  /*
  .mobile-hidden {
    display: none;
  }
  */
}

/* Планшет – можно показывать оба блока, но с изменёнными пропорциями */
@media (min-width: 768px) and (max-width: 1023px) {
  .chats-list {
    width: 250px;
  }
}

/* Футер только для мобилок и планшетов */
.app-footer {
  padding: 10px;
  background: #f5f5f5;
  text-align: center;
}
</style>