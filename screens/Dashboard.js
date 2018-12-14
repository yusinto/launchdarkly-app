import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {Text, FlatList, Switch} from 'react-native';
import gql from 'graphql-tag';
import {Mutation, Query, graphql} from 'react-apollo';
import styled from 'styled-components/native';
import {Svg} from 'expo';
import {Entypo} from '@expo/vector-icons';
import colors from '../constants/Colors';

// HACK: hardcode project and environment for now
const PROJKEY = 'string';
const ENVKEY = 'production';

const GET_FLAGS = gql`
    {
        flags(projKey: "${PROJKEY}") {
            name
            key
            version
            kind
            environments {
                key
                killSwitch
            }
        }
    }
`;
const TOGGLE_KILLSWITCH = gql`
    mutation ToggleKillSwitch($projKey: String!, $envKey: String!, $flagKey: String!) {
        toggleKillSwitch(projKey: $projKey, envKey: $envKey, flagKey: $flagKey) {
            name
            key
            environments {
                key
                killSwitch
            }
        }
    }
`;
const ListItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  margin-left: 20px;
  margin-right: 30px;
`;
const ListItemLeftGroup = styled.View`
  flex-direction: row;
`;
const FlagDisplayName = styled.Text`
  font-size: 18px;
  margin-left: 5px;
`;
const Separator = styled.View`
  width: 100%;
  background-color: rgba(0,0,0,.1);
  height: 1px;
`;
const Hamburger = styled.View`
  margin-left: 10px;
`;

class DashboardScreen extends Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Dashboard',
    headerLeft: <Hamburger>
      <Entypo name="menu" size={32} color="white"
              onPress={navigation.getParam('toggleDrawer')}/>
    </Hamburger>,
    headerStyle: {
      backgroundColor: '#3a6073',
    },
    headerTitleStyle: {
      color: '#fff',
    },
  });

  renderItem = ({item: {key: flagKey, name, environments}}) => {
    // HACK: hardcode to production for now
    const {killSwitch} = environments.find(env => env.key === ENVKEY);
    return (
      <ListItem>
        <ListItemLeftGroup>
          <Svg height={20} width={20}>
            <Svg.Circle
              cx="10"
              cy="12"
              r={5}
              fill={colors.secondary}
            />
          </Svg>
          <FlagDisplayName>{name}</FlagDisplayName>
        </ListItemLeftGroup>
        <Switch
          onValueChange={() => {
            this.props.toggleKillSwitch({variables: {flagKey}});
          }}
          value={killSwitch}
          trackColor={{true: colors.secondary}}
        />
      </ListItem>);
  };

  toggleDrawer = () => this.props.navigation.toggleDrawer();

  componentDidMount() {
    this.props.navigation.setParams({toggleDrawer: this.toggleDrawer});
    // this.toggleDrawer();
  }

  render() {
    return (
      <Query query={GET_FLAGS}>
        {
          ({loading, error, data, refetch}) => {
            if (error) return <Text>{`Error! ${error.message}`}</Text>;
            return (
              <FlatList
                data={data.flags}
                renderItem={this.renderItem}
                ItemSeparatorComponent={Separator}
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

const DashboardScreenGraphql = graphql(TOGGLE_KILLSWITCH, {
  name: 'toggleKillSwitch',
  options: {
    variables: {
      projKey: PROJKEY,
      envKey: ENVKEY,
    },
    update: (proxy, {data: {toggleKillSwitch}}) => {
      const cachedData = proxy.readQuery({ query: GET_FLAGS });
      const modifiedFlag = cachedData.flags.find(f => f.key === toggleKillSwitch.key);
      modifiedFlag.environments = toggleKillSwitch.environments;
      proxy.writeQuery({ query: GET_FLAGS, data: cachedData });
    },
  },
})(DashboardScreen);

export default createStackNavigator({
  Dashboard: {
    screen: DashboardScreenGraphql,
  },
});