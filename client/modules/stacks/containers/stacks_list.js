import { useDeps, composeAll, composeWithTracker, compose } from 'mantra-core';
import loading from '/client/modules/core/components/loading';
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

export default composeAll(
  composeWithTracker(composer, loading),
  useDeps(depsMapper)
)(StacksList);
