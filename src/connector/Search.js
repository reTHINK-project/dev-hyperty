const DOMAINS = ['hybroker.rethink.ptinovacao.pt'];

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
  users(usersURLs) {

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
          DOMAINS.forEach((domain) => {
            getUsers.push(_this.discovery.discoverHyperty(userURL, ['connection'], ['video', 'audio'], domain));
          });
        });

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

          resolve(result);

        }).catch((reason) => {
          console.error(reason);
          resolve(usersURLs);
        });
      }
    });
  }
}

export default Search;
