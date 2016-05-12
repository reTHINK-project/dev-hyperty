import { expect } from 'chai'
import rethink from './resources/.well-known/runtime/rethink'

describe('Location Hyperty', () => {
    describe('getCurrentPosition', () => {
        xit('should return your current location', (done) => {
            let locationHyURL = 'hyperty-catalogue://localhost/.well-known/hyperty/LocationHyperty'    

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
            let locationHyURL = 'hyperty-catalogue://localhost/.well-known/hyperty/LocationHyperty'    
            let locationObserverURL = 'hyperty-catalogue://localhost/.well-known/hyperty/FakeLocationObserverHyperty'    

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
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
