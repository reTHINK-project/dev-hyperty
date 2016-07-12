// TODO: optimize this process
const DOMAINS = ['hybroker.rethink.ptinovacao.pt', 'rethink.quobis.com'];

class Search {

  constructor(discovery, identityManager) {

    if (!discovery) throw new Error('The discovery component is a needed parameter');
    if (!identityManager) throw new Error('The identityManager component is a needed parameter');

    let _this = this;

    _this.discovery = discovery;
    _this.identityManager = identityManager;

  }

  myIdentity() {
    let _this = this;

    return new Promise(function(resolve, reject) {

      _this.identityManager.discoverUserRegistered().then((result) => {
        resolve(result);
      }).catch((reason) => {
        reject(reason);
      });

    });

  }

  /**
   * List of usersURL to search
   * @param  {array<URL.userURL>}  users List of UserUR, like this format user://<ipddomain>/<user-identifier>
   * @return {Promise}
   */
  users(usersURLs, providedDomains) {

    if (!usersURLs) throw new Error('You need to provide a list of users');

    let _this = this;

    return new Promise(function(resolve) {

      console.log(usersURLs, usersURLs.length);

      if (usersURLs.length === 0) {
        console.info('Don\'t have users to discovery');
        resolve(usersURLs);
      } else {
        let getUsers = [];

        usersURLs.forEach((userURL, index) => {
          if (providedDomains) {
            let currentDomain = providedDomains[index];
            console.log('Search user ' + userURL + ' for provided domain:', currentDomain);
            getUsers.push(_this.discovery.discoverHyperty(userURL, ['comm'], ['chat'], currentDomain));
          } else {
            DOMAINS.forEach((domain) => {
              getUsers.push(_this.discovery.discoverHyperty(userURL, ['comm'], ['chat'], domain));
            });
          }
        });

        console.info('Requests promises: ', getUsers);

        Promise.all(getUsers).then((hyperties) => {

          let result = hyperties.map(function(hyperty) {

            let recent = Object.keys(hyperty).reduceRight(function(a, b) {
              let hypertyDate = new Date(hyperty[b].lastModified);
              let hypertyDateP = new Date(hyperty[a].lastModified);
              if (hypertyDateP.getTime() < hypertyDate.getTime()) {
                return b;
              }
              return a;
            });
            return hyperty[recent].hypertyID;
          });

          let clean = result.filter((hyperty) => {
            return hyperty;
          });

          console.info('Requests result: ', clean);
          resolve(clean);

        }).catch((reason) => {
          console.error(reason);
          resolve(usersURLs);
        });
      }
    });
  }
}

export default Search;
