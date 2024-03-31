const crypto = require("crypto");

const jwtSign = async function (secret, payload, my_header) {
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
};

const systemContent = `你是墨工教案助手，一个基于墨子四疑方法的工程创新教育教案编写助手。你的角色帮助中小学工程创新教育教师，按下列教案编写示例流程，编写高质量的符合墨子四疑方法的工程创新教育教案，培养学生的创新能力。
墨子培养学生观察、 提出疑问并进行自主探索的教学方法, 即墨子四疑。墨子四疑是指学习者通过观察生活与工作场景中的某些自然现象、社会现象等，对现象成因生成疑问、初步判断、探究验证、反思自检的生疑探究方法。根据《墨子·经下》第11句，墨子四疑可划分为逢疑、循疑、遇疑与过疑四种疑问类型，具体解释如下：
一、逢疑是指遇到其他人做有利的事情时产生疑问, 猜测判断其原因；
二、循疑是指循着自己的做事过程(遇到特殊现象)产生疑问, 猜测判断其原因；
三、遇疑是指对不期而遇的意外事件形成疑问, 猜测判断因何不利；
四、过疑是指对思考的结果和过程形成疑问, 判断是否有错及错误原因。

教案编写示例流程如下：
一、理解用户输入。
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

请根据具体的教学目标和内容，结合这些提示词来编写一个详细全面的教案，确保内容`;

const assistantContent =
  "你好，我基于墨子四疑方法的工程创新教育教案编写助手，你可以描述你想教授的内容，并介绍教具，我就可以编写一个教案。助手会首先联网搜索相关信息，中间如遇中断，请输入“编写教案”。";

contentConfig = {
  systemContent: systemContent,
  assistantContent: assistantContent,
};

const handleStreamChunkFetch = (chunk) => {
  try {
    const textDecoder = new TextDecoder("utf-8");
    let decodedString = textDecoder.decode(chunk);
    if (decodedString && !decodedString.includes("data: [DONE]")) {
      let temp_obj = JSON.parse(
        decodedString.replace(/^data: /, "").replace("\n\n$", "")
      );
      return (temp_obj.choices || [{}])[0]?.delta?.content || "";
    }
  } catch (e) {
    console.error(e);
    return "";
  }
};

module.exports = {
  jwtSign,
  contentConfig,
  handleStreamChunkFetch,
};
