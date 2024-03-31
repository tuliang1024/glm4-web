<template>
  <div class="container">
    <div class="center-container">
      <div class="chat-container" ref="chatContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.isUser ? 'user-message' : 'gpt-message']"
        >
          <img
            v-if="msg.isUser"
            class="user-avatar"
            src="@/assets/image/user_avatar.png"
            alt="User Avatar"
          />
          <img
            v-else
            class="gpt-avatar"
            src="@/assets/image/mozi_avatar.png"
            alt="ChatGPT Avatar"
          />
          <div class="message-content">
            <div v-if="msg.isUser" class="user-name">You</div>
            <div v-else>墨工教案</div>
            <div v-html="markdown.render(msg.text)"></div>
          </div>
        </div>
      </div>
      <div class="input-container">
        <input
          type="text"
          v-model="userInput"
          class="input-box"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
        />
        <button class="send-button" @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>
  
  <script>
import MarkdownIt from "markdown-it";
export default {
  data() {
    return {
      userInput: "",
      messages: [],
      buffer: "",
      markdown: new MarkdownIt(),
    };
  },
  methods: {
    async sendMessage() {
      if (this.userInput.trim() !== "") {
        this.messages.push({ text: this.userInput, isUser: true });
        const res = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/fetchZhiPuAPI`,
          {
            method: "POST",
            body: JSON.stringify({
              message: this.userInput,
            }),
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
          }
        );
        this.messages.push({ text: "", isUser: false });
        const reader = res.body.getReader();
        this.buffer = "";
        await this.fn_handelStream(reader);

        this.userInput = "";
        // Simulate ChatGPT response
      }
    },
    async fn_handelStream(reader) {
      const res_stream = await reader.read();

      if (res_stream.done) {
        console.log("Stream closed");
        return;
      } else {
        this.buffer += new TextDecoder("utf-8").decode(res_stream.value);
        const lines = this.buffer.split("\n\n");
        this.buffer = lines.pop();

        for (let i in lines) {
          const line = lines[i];
          this.handleStreamChunkFetch(line);
        }
        return this.fn_handelStream(reader);
      }
    },
    handleStreamChunkFetch(chunk) {
      // 注意：这里的chunk是原始流数据块格式（`data:  ...\n\n`），你需要根据你的具体业务具体处理。
      if (!chunk.includes("data: [DONE]")) {
        let temp_obj = JSON.parse(
          chunk.replace(/^data: /, "").replace("\n\n$", "")
        );
        // console.log((temp_obj.choices || [{}])[0]?.delta?.content || "");
        this.messages[this.messages.length - 1].text +=
          (temp_obj.choices || [{}])[0]?.delta?.content || "";
      }
    },
  },
};
</script>
  
  <style>
.container {
  width: 800px; /* 可以根据需要调整 */
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 99vh;
  box-sizing: border-box;
}

.center-container {
  width: 100%; /* 可以根据需要调整 */
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 99vh;
  box-sizing: border-box;
}
.chat-container {
  width: 800px;
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.user-avatar,
.gpt-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.user-message .message-content {
  background-color: #dcf8c6;
  border-radius: 10px;
  padding: 10px;
}
.gpt-message .message-content {
  background-color: #f2f2f2;
  border-radius: 10px;
  padding: 10px;
}
.input-container {
  width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.input-box {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid gray;
}
.send-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
}
.chat-container::-webkit-scrollbar {
  width: 10px;
}
.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.chat-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}
.chat-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>