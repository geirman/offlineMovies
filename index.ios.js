/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
// ***
// The following lines from...
// https://github.com/nolanlawson/pouchdb-async-storage
// Throw an exception: Requiring unknown module "request" and suggests restarting the packager, which doesn't help.
// ****
//
// var PouchDB = require('pouchdb');
//     require('pouchdb-async-storage');
// var db = new PouchDB('mydb', {adapter: 'asyncstorage'});
var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
var PAGE_SIZE = 25;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;

var {
  AppRegistry,
  StyleSheet,
  Image,
  ListView,
  Text,
  View,
  AsyncStorage,
  TextInput,
  ActivityIndicatorIOS,
} = React;

var offlineMovies = React.createClass({
  
  getInitialState: function() {
    // AsyncStorage.removeItem('movies');
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };
  },

  componentDidMount: function() {
    this.fetchData();
  },

  fetchData: function() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        console.log('SUCCESS: Live data retrieved and cached');
        
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.movies),
          loaded: true,
        });
        AsyncStorage.setItem('movies', JSON.stringify(responseData.movies));
      })
      .catch((warning) => {
        console.log('WARN: unable to retrieve live data, so attempting to grab cache instead', warning);
        
        AsyncStorage.getItem('movies')
        .then((response) => {
          console.log('SUCCESS: cached data retrieved'),
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(JSON.parse(response)),
            loaded: true,
          });
        })
        .catch((error) => {
          console.log('ERROR: unable to retrieve live nor cached data')
        });      
      }).done();
  },

  render: function() {
    if(!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow= {this.renderMovie}
        renderHeader = {this.searchView}
        style={styles.listView}
      />
    )
  },

  searchView: function() {
    return (
      <View style={styles.search}>
        <TextInput 
          style={{height: 40, borderColor: 'gray', borderWidth: 1}} 
          clearButtonMode='while-editing'
          placeholder='Find a movie'
        />
      </View>
    )
  },

  renderLoadingView: function() {
    return (
      <View style={styles.container}>
        <ActivityIndicatorIOS 
          color="#cc5500" 
          size="large"
          />
      </View>
    )
  },

  renderMovie: function(movie) {

    return (
      <View style={styles.container}>
        <Image 
          source={{ uri: movie.posters.thumbnail }} 
          style={styles.thumbnail}
        />
        <View style={styles.containerRight}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
        </View>
      </View>
    );
    
  }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  containerRight: {
    flex: 1,
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('offlineMovies', () => offlineMovies);
