import { Settings } from '/lib/collections';

// update the MAIL_URL any time the setting doc changes
export default function () {
  Settings.find().observe({
    added(doc) {
      if (doc.mailUrl) {
        process.env.MAIL_URL = doc.mailUrl;
      }
    },
    changed(newDoc) {
      if (newDoc.mailUrl) {
        process.env.MAIL_URL = newDoc.mailUrl;
      }
    }
  });
}
