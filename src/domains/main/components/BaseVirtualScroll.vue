<template>
  <div ref="containerRef" class="virtual-scroll-container">
    <div
      ref="scrollContentRef"
      class="virtual-scroll-content"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item, item.index)"
        :data-index="item.index"
        class="virtual-scroll-item"
        :style="{ transform: `translateY(${getItemTop(item.index)}px)` }"
      >
        <slot :item="item.item" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type Ref,
  type PropType,
} from 'vue';

// Типы
export type VirtualScrollItem = any;

export interface VirtualScrollProps<T = VirtualScrollItem> {
  items: T[];
  estimatedItemHeight?: number;
  keyField?: string | ((item: T, index: number) => string | number);
  buffer?: number;
}

const props = defineProps({
  items: {
    type: Array as PropType<VirtualScrollItem[]>,
    required: true,
  },
  estimatedItemHeight: {
    type: Number,
    default: 80,
  },
  keyField: {
    type: [String, Function] as PropType<string | ((item: any, index: number) => string | number)>,
    default: undefined,
  },
  buffer: {
    type: Number,
    default: 5,
  },
});

// Слоты
defineSlots<{
  default(props: { item: any; index: number }): any;
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const scrollContentRef = ref<HTMLElement | null>(null);

// Состояние
const containerHeight = ref(0);
const scrollTop = ref(0);
const itemHeights = ref<Map<number, number>>(new Map());
const resizeObservers = new Map<HTMLElement, ResizeObserver>();

// Вычисляемые значения
const totalHeight = computed(() => {
  if (props.items.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < props.items.length; i++) {
    total += itemHeights.value.get(i) ?? props.estimatedItemHeight;
  }
  return total;
});

const getItemOffset = (index: number): number => {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += itemHeights.value.get(i) ?? props.estimatedItemHeight;
  }
  return offset;
};

const getItemTop = (index: number): number => {
  return getItemOffset(index);
};

const findStartIndex = (scrollTopVal: number): number => {
  if (props.items.length === 0) return 0;
  let low = 0;
  let high = props.items.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const offset = getItemOffset(mid);
    if (offset < scrollTopVal) {
      low = mid + 1;
    } else if (offset > scrollTopVal) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return Math.max(0, low);
};

const visibleItems = computed(() => {
  if (props.items.length === 0 || containerHeight.value === 0) return [];

  const startIndex = Math.max(0, findStartIndex(scrollTop.value) - props.buffer);
  const endIndex = Math.min(
    props.items.length - 1,
    findStartIndex(scrollTop.value + containerHeight.value) + props.buffer
  );

  const result = [];
  for (let i = startIndex; i <= endIndex; i++) {
    result.push({
      item: props.items[i],
      index: i,
    });
  }
  return result;
});

// Функция получения ключа
const getItemKey = (item: any, index: number): string | number => {
  if (props.keyField) {
    if (typeof props.keyField === 'function') {
      return props.keyField(item, index);
    }
    return item[props.keyField] ?? index;
  }
  return index;
};

// Обновление высоты элемента
const updateItemHeight = (index: number, height: number) => {
  const currentHeight = itemHeights.value.get(index);
  if (currentHeight !== height) {
    itemHeights.value.set(index, height);
    // Триггерим реактивность через замену карты (или forceUpdate)
    itemHeights.value = new Map(itemHeights.value);
  }
};

// Наблюдение за элементами DOM для определения высоты
const observeItem = (el: HTMLElement, index: number) => {
  if (resizeObservers.has(el)) return;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const newHeight = entry.contentRect.height;
      if (newHeight > 0) {
        updateItemHeight(index, newHeight);
      }
    }
  });
  resizeObserver.observe(el);
  resizeObservers.set(el, resizeObserver);
};

// Сброс наблюдателей
const disconnectObservers = () => {
  resizeObservers.forEach((observer, el) => {
    observer.disconnect();
    resizeObservers.delete(el);
  });
};

// Обработка скролла
const onScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollTop.value = target.scrollTop;
};

// Обработка изменения размера контейнера
const observeContainer = () => {
  if (!containerRef.value) return;
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerHeight.value = entry.contentRect.height;
    }
  });
  resizeObserver.observe(containerRef.value);
  return resizeObserver;
};

// Синхронизация наблюдателей для видимых элементов
watch(visibleItems, async () => {
  await nextTick();
  if (!scrollContentRef.value) return;

  const items = scrollContentRef.value.querySelectorAll('.virtual-scroll-item');
  items.forEach((itemEl) => {
    const indexAttr = itemEl.getAttribute('data-index');
    if (indexAttr !== null) {
      const index = parseInt(indexAttr, 10);
      if (!isNaN(index) && !resizeObservers.has(itemEl as HTMLElement)) {
        observeItem(itemEl as HTMLElement, index);
      }
    }
  });
});

// Сброс высот при изменении массива items
watch(
  () => props.items,
  () => {
    itemHeights.value.clear();
    disconnectObservers();
    // Принудительный пересчет
    itemHeights.value = new Map();
    if (containerRef.value) {
      containerRef.value.dispatchEvent(new Event('scroll'));
    }
  },
  { deep: true }
);

// Монтирование и очистка
let containerObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', onScroll);
    containerObserver = observeContainer();
    // Инициализируем высоту
    containerHeight.value = containerRef.value.clientHeight;
  }
});

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', onScroll);
  }
  if (containerObserver) {
    containerObserver.disconnect();
  }
  disconnectObservers();
});
</script>

<style scoped>
.virtual-scroll-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  contain: strict;
}

.virtual-scroll-content {
  position: relative;
  width: 100%;
  contain: layout;
}

.virtual-scroll-item {
  position: absolute;
  left: 0;
  right: 0;
  contain: layout style paint;
}
</style>