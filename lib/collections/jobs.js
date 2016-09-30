import { JobCollection } from 'meteor/vsivsi:job-collection';

const Jobs = JobCollection('job-queue', { noCollectionSuffix: true });

export default Jobs;
