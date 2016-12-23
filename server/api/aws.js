import AWS from 'aws-sdk';
import { Settings } from '/lib/collections';
import Logger from './logger';

const { accessKey, secretKey, region } = Settings.get('aws', {});

if (!accessKey || !secretKey || !region) {
  Logger.warn('Missing AWS credentials. The AWS SDK will not work.');
} else {
  AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region
  });
}

export default AWS;
