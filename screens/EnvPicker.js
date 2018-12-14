import React, {Component} from 'react';
import {createStackNavigator, withNavigation} from 'react-navigation';
import {Text, SectionList, TouchableHighlight} from 'react-native';
import gql from "graphql-tag";
import {Query} from "react-apollo";
import styled from 'styled-components/native';
import {Entypo} from '@expo/vector-icons';
import {map, sortBy, keys} from "lodash";

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


const ProjectItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 35px;
  margin-left: 20px;
  margin-right: 30px;
  font-size: 9px;
`;

const ProjectDisplayName = styled.Text`
  font-size: 9px;
  margin-left: 5px;
`;

const EnvironmentItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  margin-left: 20px;
  margin-right: 30px;
`;

const EnvironmentDisplayName = styled.Text`
  font-size: 18px;
  margin-left: 5px;
`;

const Separator = styled.View`
  width: 100%;
  background-color: rgba(0,0,0,.1);
  height: 1px;
`;

const SectionSeparator = styled.View`
  width: 100%;
  background-color: rgba(0,0,0,.1);
  height: 2px;
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

  renderItem = ({item: {key, name}, index, section: {key: project}}) => {
    return (
        <EnvironmentItem>
          <TouchableHighlight onPress={() => this.onSelect(project, key)} underlayColor="white">
            <EnvironmentDisplayName>D{name || key}</EnvironmentDisplayName>
          </TouchableHighlight>
        </EnvironmentItem>
    );
  };

  onSelect = (projKey, envKey) => {
    this.props.navigation.navigate('Dashboard', {projKey, envKey});
  };

  render() {
    return (
        <Query query={GET_PROJECTS}>
          {
            ({loading, error, data, refetch}) => {
              if (error) return <Text>{`Error! ${error.message}`}</Text>;
              return (
                  <SectionList
                      renderSectionHeader={({section: {title}}) => (
                          <ProjectItem><ProjectDisplayName>{title}</ProjectDisplayName></ProjectItem>
                      )}
                      sections={
                        map(sortBy(data.projects, [(f) => f.name || f.key]), (v) => {
                          return {
                            title: v.name || v.key,
                            key: v.key,
                            data: v.environments,
                          }
                        })}
                      ItemSeparatorComponent={Separator}
                      // SectionSeparatorComponent={SectionSeparator}
                      renderItem={this.renderItem}
                      onRefresh={() => refetch()}
                      refreshing={loading}
                      stickySectionHeadersEnabled={true}
                  />
              );
            }
          }
        </Query>
    );
  }
}

export default withNavigation(EnvPicker);