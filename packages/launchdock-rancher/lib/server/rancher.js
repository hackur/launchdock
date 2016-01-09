
Rancher = function Rancher (apiKey, secret) {
  this.apiKey = apiKey || Settings.get('rancherApiKey');
  this.apiSecret = secret || Settings.get('rancherApiSecret');
  this.apiBaseUrl = Settings.get('rancherApiUrl');
  this.apiFullUrl = this.apiBaseUrl + "/v1/";

  this.checkCredentials = function () {
    if (!this.apiKey || !this.apiSecret) {
      const err = "Missing Rancher API credentials.";
      Logger.error(err);
      throw new Meteor.Error(err);
    }
  };
}
