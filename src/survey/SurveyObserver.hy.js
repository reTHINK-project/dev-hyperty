import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'

let SurveyObserver = {
    onRequest (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.objectDescURL && event.value.resources[0] === 'survey' ){
                    this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        dataObject.onAddChild(msg=>{
                            callback({
                                answer:(answer)=>{
                                    dataObject.addChild('resources', {response:answer})
                                },
                                data:msg.value.survey
                            })
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
