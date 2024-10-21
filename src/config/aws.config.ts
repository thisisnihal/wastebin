import AWS from 'aws-sdk';
import { conf } from 'src/conf';

export const s3 = new AWS.S3({
  accessKeyId: conf.AWS_ACCESS_KEY_ID,
  secretAccessKey: conf.AWS_SECRET_ACCESS_KEY,
  region: conf.AWS_REGION,
});

