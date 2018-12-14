import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {View, Icon, Text, FlatList, Switch, StyleSheet, Image, Button} from 'react-native';
import gql from "graphql-tag";
import {Query} from "react-apollo";
import styled from 'styled-components/native';
import {Svg} from 'expo';
import {Entypo} from '@expo/vector-icons';
import colors from '../constants/Colors';
import { sortBy } from "lodash";

const GET_FLAGS = gql`
    {
        flags(projKey: "string") {
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

const HeaderContainer = styled.View`
  margin: 20px 20px;
  border-bottom-width: 1px;
  border-bottom-color: rgba(0,0,0,.1);
`;
const HeaderText = styled.Text`
  font-size: 20px;
  font-weight: 400;
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
    headerRight: <Button
      title="Switch"
      // icon={
      // <Icon
      //     name='cards'
      //     size={15}
      //     color='white'
      // />}
      onPress={() => navigation.navigate('EnvPicker')}
    />,
    headerStyle: {
      backgroundColor: '#3a6073',
    },
    headerTitleStyle: {
      color: '#fff',
    },
  });

  renderHeader = () =>
    <HeaderContainer>
      <HeaderText>Your feature flags</HeaderText>
    </HeaderContainer>;

  renderItem = ({item: {key, name, environments}}) => {
    // HACK: hardcode to production for now
    const {killSwitch} = environments.find(e => e.key === 'production');
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
          onValueChange={this._handleToggleSwitch}
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
                data={ sortBy(data.flags, [ (f) => f.key ]) }
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

export default createStackNavigator({
  Dashboard: {
    screen: DashboardScreen,
  },
  EnvPicker: {
    screen: EnvPicker
  }
});