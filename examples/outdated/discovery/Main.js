import Logo from './Logo'

const Main = React.createClass({

    onUserListChanged() {
        this.setState({users: this.props.hyperty.queryUsers()})
    },

    getInitialState(){
      this.props.hyperty.onUserListChanged(this.onUserListChanged)

      return {users:this.props.hyperty.queryUsers()};
    },

    handleInputChange (event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
          [name]: value
        });
    },

    search () {
        let filter = this.state.filter?JSON.parse(this.state.filter):null
        let result = this.props.hyperty.queryUsers(filter)
        this.setState({search_result: JSON.stringify(result)})
    },

    render() {
        return (<div className="container-fluid">
                <Logo />
                <div className="row">
                    <div className="col-sm-12">
                        <a href="#">Users <span className="badge">{this.state.users.length}</span></a>
                    </div>
                </div>
                <div className="row">
                    <form>
                      <div className="form-group">
                        <label htmlFor="search">Search</label>
                        <input type="text" name="filter" onChange={this.handleInputChange} className="form-control" id="search" placeholder="{'username':'openidtest20@gmail.com'}"/>
                      </div>
                      <button type="button" className="btn btn-default" onClick={this.search}>Search</button>
                    </form>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        {this.state.search_result}
                    </div>
                </div>
        </div>);
    }
});

export default Main
