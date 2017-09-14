import URI from 'urijs'
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery'
import { Syncher} from 'service-framework/dist/Syncher'

let Survey = {
    results: [],

    _addResponse(result){
        this.results = this.results.concat([result])
    }
}

const SurveyReporter = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            return this.hypertyDiscoveryService.discoverHypertiesPerUser(p.email, p.domain)
                .then((hyperties)=>{
                    return Object.keys(hyperties)
                        .map((key)=>{return {key:key, descriptor:hyperties[key].descriptor, lastModified:hyperties[key].lastModified}})
                        .filter((desc)=>desc.descriptor.endsWith('SurveyObserver'))
                        .sort((a,b)=>(new Date(a.lastModified)<new Date(b.lastModified))?1:-1)
                        .shift().key
                })
        }))
    },

    _createSyncher (survey, hyperties){
        return this.syncher.create(this.objectDescURL, hyperties, { survey: survey })
    },

    create (survey, participants) {
        return this._getHyFor(participants)
            .then((hyperties)=>this._createSyncher(survey, hyperties))
            .then((dataObjectReporter) => {
                dataObjectReporter.onSubscription((event)=>event.accept())
                dataObjectReporter.onAddChild((dataChild)=>{
                    Survey._addResponse(dataChild.value.response)
                })
                Survey.config = survey
                return Survey
            })
    }
}

const SurveyReporterFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let syncher = new Syncher(hypertyURL, bus, config)
    return Object.assign(Object.create(SurveyReporter), {
        hypertyDiscoveryService: hypertyDiscovery,
        objectDescURL: 'hyperty-catalogue://catalogue.' + uri.hostname() + '/.well-known/dataschema/Communication',
        hypertyURL: hypertyURL,
        syncher: syncher
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'SurveyReporter',
        instance: SurveyReporterFactory(hypertyURL, bus, config)
    }
}
