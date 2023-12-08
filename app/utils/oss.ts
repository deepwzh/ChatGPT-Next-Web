import AWS from "aws-sdk";
import { getServerSideConfig } from "../config/server";

class OSSClient {
  client: AWS.S3;
  bucket: string;
  constructor(cfg: ReturnType<typeof getServerSideConfig>) {
    this.bucket = cfg.oss_bucket_name || "";
    this.client = new AWS.S3({
      endpoint: cfg.oss_host,
      region: cfg.oss_region,
      accessKeyId: cfg.oss_access_key_id || "",
      secretAccessKey: cfg.oss_access_key_secret || "",
    });
  }

  uploadFile(path: string, file: File) {
    return new Promise((resolve, reject) => {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: path,
        Body: file,
      };

      this.client.upload(
        params,
        function (err: Error, data: AWS.S3.ManagedUpload.SendData) {
          if (err) {
            reject(err);
          } else {
            resolve({ url: data.Location });
          }
        },
      );
    });
  }
}

export function getOSSClient() {
  const cfg = getServerSideConfig();
  if (
    cfg.oss_access_key_id !== undefined &&
    cfg.oss_access_key_secret !== undefined &&
    cfg.oss_bucket_name !== undefined
  ) {
    const client = new OSSClient(cfg);
    return client;
  }
  return null;
}
