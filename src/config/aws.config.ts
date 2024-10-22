import { conf } from 'src/conf';
import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  credentials: {
    accessKeyId: conf.AWS_ACCESS_KEY_ID!,
    secretAccessKey: conf. AWS_SECRET_ACCESS_KEY!
  },
  region: conf.AWS_REGION
});