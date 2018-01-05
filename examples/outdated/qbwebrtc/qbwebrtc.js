import Main from './Main'

export default function hypertyLoaded(result) {
    result.instance.identityManager.discoverUserRegistered()
        .then((identity) => {
            const element = <Main identity={identity} runtimeHypertyURL={result.runtimeHypertyURL} hyperty={result.instance} />;
            ReactDOM.render(element, document.getElementById('root'));
        }).catch(console.error);
}
