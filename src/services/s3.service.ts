import {s3} from '@config/aws.config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { conf } from 'src/conf';
import { v4 as uuidv4 } from 'uuid';
import * as Helper from '@util/helper';
import { Readable } from 'stream';

class S3Service {
  private bucketName: string = conf.AWS_S3_BUCKET_NAME || '';

  async uploadText(text: string): Promise<string> {
    const s3Key = `${uuidv4()}-${Date.now()}.txt`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: text,
      ContentType: 'text/plain',
    });
    await s3.send(command);
    return s3Key;
  }

  async getText(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const { Body } = await s3.send(command);
    const text = await Helper.streamToString(Body as Readable);
    return text;
  }


  async getPresignedUploadUrl(): Promise<{presignedUrl : String, s3Key : String}> {
    const s3Key = `${uuidv4()}-${Date.now()}.txt`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: 'text/plain',
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {presignedUrl, s3Key}; 
  }

  async getPresignedFetchUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return presignedUrl; 
  }

  async deleteObject(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    await s3.send(command);
  }
}

export default new S3Service();
