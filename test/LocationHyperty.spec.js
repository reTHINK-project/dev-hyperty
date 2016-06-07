import { expect } from 'chai'
//import rethink from './resources/.well-known/runtime/rethink'
import RuntimeLoader from 'service-framework/dist/RuntimeLoader';
import InstallerFactory from '../resources/factories/InstallerFactory';

describe('Location Hyperty', () => {
    let domain = 'hybroker.rethink.ptinovacao.pt'
    let hypertyName = 'Location'
    let locationHyURL = 'hyperty-catalogue://' + domain + '/.well-known/hyperties/' + hypertyName;
    describe('getCurrentPosition', () => {
        xit('should return your current location', (done) => {
            let runtime = 'https://catalogue.' + domain + '/.well-known/runtime/Runtime';
            let installerFactory = new InstallerFactory();
            let runtimeLoader = new RuntimeLoader(installerFactory, runtime);

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(locationHyURL).then((result) => {
                        result.instance.getCurrentPosition()
                            .then((location)=>{
                                    expect(location).to.be.a('Geoposition') 
                                    done()
                            })
                    }) 
                })
        })
    })

    describe('startPositionBroadcast', ()=>{
        it('should notify current position to any subscribed hyperty', (done)=>{
            let domain = 'hybroker.rethink.ptinovacao.pt'
            let hypertyName = 'Location'
            let locationHyURL = 'hyperty-catalogue://' + domain + '/.well-known/hyperties/' + hypertyName;
            let locationObserverURL = 'hyperty-catalogue://' + domain + '/.well-known/hyperties/FakeLocationObserver'    

            runtimeLoader.install()//{domain: 'localhost', development: true})
                .then(()=> { //(runtime) =>{
                    runtime.requireHyperty(locationObserverURL).then((result) => {
                        let observer = result
                        runtime.requireHyperty(locationHyURL).then((result) => {
                            result.instance.startPositionBroadcast([observer.runtimeHypertyURL])
                            setTimeout(()=>{
                                expect(observer.instance.receivedPosition).to.be.true 
                                done()
                            },5000)
                        })
                    }) 
                })
        })
    })
})
