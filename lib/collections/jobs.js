import { JobCollection } from 'meteor/vsivsi:job-collection';

const Jobs = JobCollection('Jobs', { noCollectionSuffix: true });

export default Jobs;
