import OSS from "ali-oss";
import { randomBytes, randomUUID } from "crypto";
import mitt from "next/dist/shared/lib/mitt";
import { getServerSideConfig } from "../config/server";

export function getOSSClient() {
  const cfg = getServerSideConfig();
  console.log(cfg);
  if (
    cfg.oss_access_key_id != undefined &&
    cfg.oss_access_key_secret != undefined
  ) {
    const client = new OSS({
      region: cfg.oss_region,
      // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
      accessKeyId: cfg.oss_access_key_id || "",
      accessKeySecret: cfg.oss_access_key_secret || "",
      bucket: cfg.oss_bucket_name,
    });
    return client;
  } else {
    return null;
  }
}
