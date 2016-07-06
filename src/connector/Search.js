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
  users(usersURLs, providedDomain) {

    if (!usersURLs) throw new Error('You need to provide a list of');

    let _this = this;

    return new Promise(function(resolve) {

      console.log(usersURLs, usersURLs.length);

      if (usersURLs.length === 0) {
        console.info('Don\'t have users to discovery');
        resolve(usersURLs);
      } else {
        console.log('Get all users');
        let getUsers = [];

        usersURLs.forEach((userURL) => {
          if (providedDomain) {
              console.log('Search for provided domain:', providedDomain);
              getUsers.push(_this.discovery.discoverHyperty(userURL, ['connection'], ['audio', 'video'], providedDomain));
          } else {
          DOMAINS.forEach((domain) => {
            getUsers.push(_this.discovery.discoverHyperty(userURL, ['connection'], ['audio', 'video'], domain));
          });
        }
      });

        console.info('Requests promises: ', getUsers);
        Promise.all(getUsers).then((hyperties) => {

          console.log('Hyperties: ', hyperties);

          let result = hyperties.map(function(hyperty) {

            let recent = Object.keys(hyperty).reduceRight(function(a, b) {
              let hypertyDate = new Date(hyperty[b].lastModified);
              let hypertyDateP = new Date(hyperty[a].lastModified);
              if (hypertyDateP.getTime() < hypertyDate.getTime()) {
                return b;
              }
              return a;
            });
            return hyperty[recent];
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
