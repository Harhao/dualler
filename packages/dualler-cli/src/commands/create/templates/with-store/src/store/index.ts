// Placeholder store module — integrate with your preferred state management
// In a real project, this would import from @dualler/runtime-core or a similar package

interface StoreState {
  count: number;
}

const state: StoreState = { count: 0 };

export const store = {
  state,
  getState() { return state; },
  increment() { state.count++; },
  decrement() { state.count--; },
  reset() { state.count = 0; },
};
