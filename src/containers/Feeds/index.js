import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import firestore from '@react-native-firebase/firestore';
import {
  FlatList, AsyncStorage,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import reactotron from 'reactotron-react-native';
import {
  FeedContainer,
} from './style';


import PetFeed from '../../components/PetFeed';

import ScreenHeader from '../../components/ScreenHeader';

const Feeds = ({ navigation }) => {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function getPets() {
      const petsCollection = await firestore().collection('pets').get();
      return petsCollection.docs.map((doc) => ({ id: doc.id, object: doc.data() }));
    }
    getPets().then(async (petsCollection) => {
      const user = await AsyncStorage.getItem('user');
      let pets = petsCollection.filter((item) => item.object.owner !== user);
      reactotron.log(pets);
      pets = pets.filter((item) => {
        const { interested } = item.object;
        return interested.filter((item) => !item.email !== user);
      });
      reactotron.log(pets);
      setPets(pets);
    });
  }, []);

  function fetchFilteredPets() {
    if (navigation.state.params) {
      setPets(navigation.state.params.filteredPets);
    }
  }

  return (
    <>
      <NavigationEvents onWillFocus={fetchFilteredPets} />
      <ScreenHeader title="Adotar" color="#ffd358" iconRight="search" iconLeft="menu" navigation={navigation} />
      <FeedContainer>
        {pets.length ? (
          <FlatList
            data={pets}
            extraData={pets}
            renderItem={({ item }) => (
              <PetFeed pet={item} route="Feeds" />
            )}
          />
        ) : null}
      </FeedContainer>
    </>
  );
};

Feeds.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    state: PropTypes.func.isRequired,
  }).isRequired,
};

export default Feeds;
