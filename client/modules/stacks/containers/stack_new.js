import { useDeps } from 'react-simple-di';
import { composeWithTracker, merge } from '/client/api';
import StackNew from '../components/stack_new';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState } = context();
  const error = LocalState.get('STACK_CREATE_ERROR');
  onData(null, { error });

  // clearErrors when unmounting the component
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  create: actions.stacks.create,
  clearErrors: actions.stacks.clearErrors
});

export default merge(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(StackNew);
