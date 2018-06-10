import Ember from 'ember';
import * as Redux from 'redux';

// declare class EmberRedux extends Ember.Object {
//
// }


// export = EmberRedux;
export type Dispatch<S> = Redux.Dispatch<S>;
export type ActionCreator<A> = Redux.ActionCreator<A>;

export interface DispatchProp<T> {
  dispatch: Dispatch<T>
}


export function connect<TStateProps>(
  mapStateToProps: MapStateToPropsParam<TStateProps>
): any;

export function connect<no_state, TDispatchProps>(
  mapStateToProps: null | undefined,
  mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps>
): any;

export function connect<TStateProps, TDispatchProps>(
  mapStateToProps: MapStateToPropsParam<TStateProps>,
  mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps>
): any;


interface MapStateToProps<TStateProps> {
  (state: any): TStateProps;
}

interface MapStateToPropsFactory<TStateProps> {
  (initialState: any): MapStateToProps<TStateProps>;
}

type MapStateToPropsParam<TStateProps> = MapStateToProps<TStateProps> | MapStateToPropsFactory<TStateProps>;

interface MapDispatchToPropsFunction<TDispatchProps> {
  (dispatch: Dispatch<any>): TDispatchProps;
}

interface MapDispatchToPropsObject {
  [name: string]: ActionCreator<any>;
}

type MapDispatchToProps<TDispatchProps> =
MapDispatchToPropsFunction<TDispatchProps> | MapDispatchToPropsObject;

interface MapDispatchToPropsFactory<TDispatchProps> {
  (dispatch: Dispatch<any>): MapDispatchToProps<TDispatchProps>;
}

type MapDispatchToPropsParam<TDispatchProps> = MapDispatchToProps<TDispatchProps> | MapDispatchToPropsFactory<TDispatchProps>;

export function route<Function>(
  routeFunc: Function
): any;

export default class EmberRedux extends Ember.Object {
}
