<template>
  <div class="chat-input-box">
    <input type="text" placeholder="Type your message..." class="input" />
    <button class="send-button">Send</button>
  </div>
</template>
  
  <script>
export default {};
</script>
  
  <style scoped>
.chat-input-box {
  display: flex;
  align-items: center;
  padding: 20px;
}

.input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
}

.send-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  margin-left: 10px;
  cursor: pointer;
}
</style>
  