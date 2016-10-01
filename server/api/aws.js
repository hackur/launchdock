import AWS from 'aws-sdk';
import { Settings } from '/lib/collections';
import Logger from './logger';

const accessKeyId = Settings.get('awsKey');
const secretAccessKey = Settings.get('awsSecret');
const region = Settings.get('awsRegion');

if (!accessKeyId || !secretAccessKey || !region) {
  Logger.warn('Missing AWS credentials. The AWS SDK will not work.');
} else {
  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    region
  });
}

export default AWS;
