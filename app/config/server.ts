import md5 from "spark-md5";
import { DEFAULT_MODELS } from "../constant";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROXY_URL?: string; // docker only

      OPENAI_API_KEY?: string;
      CODE?: string;

      BASE_URL?: string;
      OPENAI_ORG_ID?: string; // openai only

      VERCEL?: string;
      BUILD_MODE?: "standalone" | "export";
      BUILD_APP?: string; // is building desktop app

      HIDE_USER_API_KEY?: string; // disable user's api key input
      DISABLE_GPT4?: string; // allow user to use gpt-4 or not
      ENABLE_BALANCE_QUERY?: string; // allow user to query balance or not
      DISABLE_FAST_LINK?: string; // disallow parse settings from url or not
      CUSTOM_MODELS?: string; // to control custom models

      NEXT_PUBLIC_OSS_HOST?: string; // 对象存储地址
      NEXT_PUBLIC_OSS_REGION?: string; // 对象存储区域
      NEXT_PUBLIC_OSS_ACCESS_KEY_ID?: string; // access_key_id
      NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET?: string; // access_key_secret
      NEXT_PUBLIC_OSS_BUCKET_NAME?: string; // 对象存储桶名字

      DISPLAY_TITLE?: string; // 显示的标题
      DISPLAY_DESC?: string; // 显示的描述

      // azure only
      AZURE_URL?: string; // https://{azure-url}/openai/deployments/{deploy-name}
      AZURE_API_KEY?: string;
      AZURE_API_VERSION?: string;
    }
  }
}

const ACCESS_CODES = (function getAccessCodes(): Set<string> {
  const code = process.env.CODE;

  try {
    const codes = (code?.split(",") ?? [])
      .filter((v) => !!v)
      .map((v) => md5.hash(v.trim()));
    return new Set(codes);
  } catch (e) {
    return new Set();
  }
})();

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const disableGPT4 = !!process.env.DISABLE_GPT4;
  let customModels = process.env.CUSTOM_MODELS ?? "";

  if (disableGPT4) {
    if (customModels) customModels += ",";
    customModels += DEFAULT_MODELS.filter((m) => m.name.startsWith("gpt-4"))
      .map((m) => "-" + m.name)
      .join(",");
  }

  const isAzure = !!process.env.AZURE_URL;

  const apiKeyEnvVar = process.env.OPENAI_API_KEY ?? "";
  const apiKeys = apiKeyEnvVar.split(",").map((v) => v.trim());
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  const apiKey = apiKeys[randomIndex];
  console.log(
    `[Server Config] using ${randomIndex + 1} of ${apiKeys.length} api key`,
  );

  console.log("region", process.env.OSS_REGION);

  return {
    baseUrl: process.env.BASE_URL,
    apiKey,
    openaiOrgId: process.env.OPENAI_ORG_ID,

    isAzure,
    azureUrl: process.env.AZURE_URL,
    azureApiKey: process.env.AZURE_API_KEY,
    azureApiVersion: process.env.AZURE_API_VERSION,

    needCode: ACCESS_CODES.size > 0,
    code: process.env.CODE,
    codes: ACCESS_CODES,

    proxyUrl: process.env.PROXY_URL,
    isVercel: !!process.env.VERCEL,

    hideUserApiKey: !!process.env.HIDE_USER_API_KEY,
    disableGPT4,
    hideBalanceQuery: !process.env.ENABLE_BALANCE_QUERY,
    disableFastLink: !!process.env.DISABLE_FAST_LINK,
    customModels,

    oss_host: process.env.NEXT_PUBLIC_OSS_HOST,
    oss_region: process.env.NEXT_PUBLIC_OSS_REGION,
    oss_access_key_id: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID,
    oss_access_key_secret: process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET,
    oss_bucket_name: process.env.NEXT_PUBLIC_OSS_BUCKET_NAME,

    display_title: process.env.DISPLAY_TITLE,
    display_desc: process.env.DISPLAY_DESC,
  };
};
