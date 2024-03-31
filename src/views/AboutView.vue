<template>
  <div id="app" class="container">
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
            src="./assets/image/user_avatar.png"
            alt="User Avatar"
          />
          <img
            v-else
            class="gpt-avatar"
            src="./assets/image/mozi_avatar.png"
            alt="ChatGPT Avatar"
          />
          <div class="message-content">
            <div v-if="msg.isUser" class="user-name">You</div>
            <div v-else>墨工教案</div>
            <div>{{ msg.text }}</div>
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
export default {
  data() {
    return {
      userInput: "",
      messages: [],
      api_key: "2ecc9b42c59aad865f0f06ce42169764.mGutajWyL6VGzgq9",
      api_url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      system_content: `你是墨工教案助手，一个基于墨子四疑方法的工程创新教育教案编写助手。你的角色帮助中小学工程创新教育教师，按下列教案编写示例流程，编写高质量的符合墨子四疑方法的工程创新教育教案，培养学生的创新能力。
墨子培养学生观察、 提出疑问并进行自主探索的教学方法, 即墨子四疑。墨子四疑是指学习者通过观察生活与工作场景中的某些自然现象、社会现象等，对现象成因生成疑问、初步判断、探究验证、反思自检的生疑探究方法。根据《墨子·经下》第11句，墨子四疑可划分为逢疑、循疑、遇疑与过疑四种疑问类型，具体解释如下：
一、逢疑是指遇到其他人做有利的事情时产生疑问, 猜测判断其原因；
二、循疑是指循着自己的做事过程(遇到特殊现象)产生疑问, 猜测判断其原因；
三、遇疑是指对不期而遇的意外事件形成疑问, 猜测判断因何不利；
四、过疑是指对思考的结果和过程形成疑问, 判断是否有错及错误原因。

教案编写示例流程如下：
一、理解用户输入， 调用browser 工具搜索相关信息，总结结果输入\"\"\"<联网搜索>\"\"\"。
二、按照墨子四疑工程创新方法，编写面向中小学生的工程创新教育教案，包括如下内容：
1. 引言：根据\"\"\"<联网搜索>\"\"\"，综述相关背景，激发学生的兴趣和好奇心。
2. 目标：围绕用户输入设定的场景，开展一个工程小项目的创意、设计、实现和运营。
3. 创意：引导学生按照墨子四疑方法，采取逢疑、循疑、遇疑、过疑四种方式，进行场景的观察、体验，现象发掘，生成疑问，猜测成因，对结论的再判断与反思，发现可能的需求或者有价值的问题，所谓有价值就是兴利除害、可持续发展。
4. 设计：通过走访、调研、实验分析、搜集证据素材，分析目标现象、用户的行为模式与痛点来探究问题产生的原因，基于老师提供的教具和相关资料，提出一个可行的解决方案
5. 实现：基于老师提供的教具和相关资料，通过最简系统组装、测试验证，来做出一个可用的产品
6. 运营：面向面向真实的用户使用，在产品与用户交互过程中，进行需求迭代、产品优化
7. 展示：让学生回顾他们的创意、设计、实现和运营过程，分享他们的体验和成果。
8. 安全提示：强调使用工具和材料时的安全注意事项，如戴防护眼镜、小心使用尖锐工具等。
9. 补充说明：生成的教案未必准确合适，不能直接使用，仅供参考，建议人工继续修改完善。
10. 宣传海报：调用CogView给教案绘制一幅宣传海报，并解释海报的设计思路。

请根据具体的教学目标和内容，结合这些提示词来编写一个详细全面的教案，确保内容`,
      zhipu_messages: [],
      ai: null,
      the_last_message: "",
      my_headers: "",
      buffer: "",
    };
  },
  async created() {
    this.zhipu_messages.push({
      role: "system",
      content: this.system_content,
    });
    this.zhipu_messages.push({
      role: "assistant",
      content:
        "你好，我基于墨子四疑方法的工程创新教育教案编写助手，你可以描述你想教授的内容，并介绍教具，我就可以编写一个教案。助手会首先联网搜索相关信息，中间如遇中断，请输入“编写教案”。",
    });
    // 01 调用jwtSign方法，获取jwt签名
    let [id, secret] = this.api_key.split(".");
    let st = new Date().valueOf();

    let res_auth_token = await this.jwtSign(secret, {
      api_key: id,
      timestamp: st,
      exp: new Date(st + 1000 * 60 * 60).valueOf(),
    });
    // 02 调用 fetchTalk 方法，获取读取api数据
    this.my_headers = {
      Authorization: res_auth_token,
      "content-type": "application/json",
    };
  },
  methods: {
    sendMessage() {
      if (this.userInput.trim() !== "") {
        this.messages.push({ text: this.userInput, isUser: true });
        this.fetchZhiPuAPI(this.userInput);

        this.userInput = "";
        // Simulate ChatGPT response
      }
    },
    handleStreamChunk(chunk) {
      const jsonString = chunk.substring(6);
      const dataObject = JSON.parse(jsonString);
      if (!dataObject.choices[0].finish_reason) {
        this.messages[this.messages.length - 1].text +=
          dataObject.choices[0].delta.content;
        this.the_last_message += dataObject.choices[0].delta.content;
      }
    },
    // 03 - handleStreamChunk 方法：独立方法，用于处理原始流数据块。（一般由页面UI传入，处理最后的UI数据渲染）
    handleStreamChunkFetch(chunk) {
      // 注意：这里的chunk是原始流数据块格式（`data:  ...\n\n`），你需要根据你的具体业务具体处理。
      if (!chunk.includes("data: [DONE]")) {
        let temp_obj = JSON.parse(
          chunk.replace(/^data: /, "").replace("\n\n$", "")
        );
        this.the_last_message +=
          (temp_obj.choices || [{}])[0]?.delta?.content || "";
        this.messages[this.messages.length - 1].text +=
          (temp_obj.choices || [{}])[0]?.delta?.content || "";
      }
    },

    async fetchZhiPuAPI(message) {
      this.zhipu_messages.push({
        role: "user",
        content: message,
      });
      let post_body = {
        model: "glm-4",
        messages: this.zhipu_messages,
        stream: true,
      };
      let res = await fetch(this.api_url, {
        method: "post",
        headers: this.my_headers,
        body:
          typeof post_body === "object" ? JSON.stringify(post_body) : post_body,
      });

      this.messages.push({ text: "", isUser: false });
      // handle stream data
      const reader = res.body.getReader();
      // 可选 -> await fn_handelStream(reader)
      this.buffer = "";
      await this.fn_handelStream(reader);
      this.zhipu_messages.push({
        role: "assistant",
        content: this.the_last_message,
      });
      this.the_last_message = "";
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
          // Scroll to the bottom
          this.$nextTick(() => {
            // 获取聊天容器的 DOM 元素
            const chatContainer = this.$refs.chatContainer;
            // 滚动到底部
            chatContainer.scrollTop = chatContainer.scrollHeight;
          });
        }
        return this.fn_handelStream(reader);
      }
    },
    async jwtSign(secret, payload, my_header) {
      const header = my_header || { alg: "HS256", sign_type: "SIGN" };
      const encodedHeader = btoa(JSON.stringify(header));
      const encodedPayload = btoa(JSON.stringify(payload));

      if (!secret) {
        console.log("secret is empty, returned.");
        return;
      }

      // load secret
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: { name: "SHA-256" } },
        false,
        ["sign"]
      );

      // sing
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(encodedHeader + "." + encodedPayload)
      );

      // ArrayBuffer to Base64
      const encodedSignature = btoa(
        String.fromCharCode.apply(null, new Uint8Array(signature))
      );
      return encodedHeader + "." + encodedPayload + "." + encodedSignature;
    },
  },
};
</script>

<style>
.container {
  width: 100%; /* 可以根据需要调整 */
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.center-container {
  width: 100%; /* 可以根据需要调整 */
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
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