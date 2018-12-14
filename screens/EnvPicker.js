import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {Text, SectionList} from 'react-native';
import gql from "graphql-tag";
import {Query} from "react-apollo";
import styled from 'styled-components/native';
import {Entypo} from '@expo/vector-icons';
import { map, sortBy, keys } from "lodash";

const GET_PROJECTS = gql`
    {
        projects {
            name
            key
            environments {
                key
                name
            }
        }
    }
`;

class EnvPicker extends Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Pick an environment',
    headerStyle: {
      backgroundColor: '#3a6073',
    },
    headerTitleStyle: {
      color: '#fff',
    },
  });

  renderItem = ({item: {key, name}, index, section}) => {
    return (
        <Text>{name || key}</Text>
    );
  };

  toggleDrawer = () => this.props.navigation.toggleDrawer();

  render() {
    return (
        <Query query={GET_PROJECTS}>
          {
            ({loading, error, data, refetch}) => {
              if (error) return <Text>{`Error! ${error.message}`}</Text>;
              return (
                  <SectionList
                      renderSectionHeader={({section: {name, key}}) => (
                          <Text style={{fontWeight: 'bold'}}>{name || key}</Text>
                      )}
                      sections={
                        map(sortBy(data.projects, [ (f) => f.name || f.key ]), (v) => {
                        title: v.name || v.key
                        data: v.environments
                      }) }
                      renderItem={this.renderItem}
                      onRefresh={() => refetch()}
                      refreshing={loading}
                  />
              );
            }
          }
        </Query>
    );
  }
}

export default createStackNavigator({
  Dashboard: {
    screen: EnvPicker,
  },
});