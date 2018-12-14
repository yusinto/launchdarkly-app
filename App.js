import React, {Component} from 'react';
import {createDrawerNavigator, createStackNavigator, createAppContainer} from 'react-navigation';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {ApolloProvider} from 'react-apollo';
import Dashboard from './screens/Dashboard';
import CustomDrawerContent from './components/CustomDrawerContent';

// HACK: hardcode project and environment for now
const PROJKEY = 'default';
const ENVKEY = 'production';

const appNavigator = createDrawerNavigator({
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      drawerLabel: 'Feature flags',
    }
  },
  Users: {
    screen: () => '',
    navigationOptions: {
      drawerLabel: 'Users',
    }
  }
},{
  initialRouteName: 'Dashboard',
  initialRouteParams: {envKey: ENVKEY, projKey: PROJKEY},
});

const App = createAppContainer(appNavigator, {
  drawerBackgroundColor: '#333',
  contentComponent: CustomDrawerContent,
  contentOptions: {
    activeTintColor: '#fff',
    activeBackgroundColor: 'rgba(0,0,0,.2)',
    inactiveTintColor: 'hsla(0,0%,100%,.6)',
    itemsContainerStyle: {
      marginVertical: 0,
    },
    iconContainerStyle: {
      opacity: 1
    }
  }
}));

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    // uri: 'http://192.168.0.15:4000',
    uri: 'http://10.0.99.57:4000',
  }),
});

export default () => (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);
