import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'

let SurveyObserver = {
    onRequest (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.objectDescURL){
                    this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        callback({
                            answer:(answer)=>{
                                dataObject.addChild('chatmessages', {response:answer})
                            },
                            data:dataObject.data.survey
                        })
                    })
            }
        })
    }
}

let SurveyObserverFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let syncher = new Syncher(hypertyURL, bus, config)
    return Object.assign(Object.create(SurveyObserver), {
        syncher: syncher,
        objectDescURL: 'hyperty-catalogue://catalogue.' + uri.hostname() + '/.well-known/dataschema/Communication',
        hypertyURL: hypertyURL,
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'SurveyObserver',
        instance: SurveyObserverFactory(hypertyURL, bus, config)
    }
}
