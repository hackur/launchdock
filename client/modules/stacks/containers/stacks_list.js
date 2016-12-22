import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import StacksList from '../components/stacks_list';

export const composer = ({ context }, onData) => {
  const { Meteor, Collections } = context();
  const { Stacks } = Collections;

  if (Meteor.subscribe('stacks-list').ready()) {
    const stacks = Stacks.find().fetch();
    onData(null, { stacks });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(StacksList);
