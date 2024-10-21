import {s3} from '@config/aws.config';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { conf } from 'src/conf';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
  private bucketName: string = conf.AWS_S3_BUCKET_NAME || '';

  async uploadText(text: string): Promise<string> {
    const s3Key = `${uuidv4()}-${Date.now()}.txt`;
    const params: PutObjectRequest = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: text,
      ContentType: 'text/plain'
    };
    await s3.putObject(params).promise();
    return s3Key;
  }

  async getText(s3Key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
    };
    const data = await s3.getObject(params).promise();
    return data.Body?.toString() || '';
  }
}

export default new S3Service();
