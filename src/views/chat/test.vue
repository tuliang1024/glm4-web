<script setup>
import ChatConversation from "@/components/ChatConversation.vue";
import ChatSidebar from "@/components/ChatSidebar.vue";
</script>

<template>
  <div class="flex h-screen w-screen">
    <div class="w-1/6">
      <ChatSidebar />
    </div>
    <div class="w-5/6 flex justify-center">
      <ChatConversation />
    </div>
  </div>
</template>

