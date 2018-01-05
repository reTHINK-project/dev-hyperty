import Main from './Main'

export default function hypertyLoaded(result) {
    const element = <Main runtimeHypertyURL={result.runtimeHypertyURL} hyperty={result.instance} />;
    ReactDOM.render(element, document.getElementById('root'));
}
