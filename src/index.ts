/**
 * @File   : index.ts
 * @Author : dtysky (dtysky@outlook.com)
 * @Date   : 10/31/2018, 6:05:33 PM
 * @Description:
 */
import * as Sein from 'seinjs';

import HUDContainer, {IContainerProps as IHUDContainerProps} from './Container';
import {
  IContextTypes as IHUDContextTypes,
  Provider,
  Consumer
} from './Context';

declare module 'seinjs' {
  export namespace ReactHUD {
    export interface IContainerProps extends IHUDContainerProps {}
    export class Container extends HUDContainer {}
    export interface IContextTypes extends IHUDContextTypes {}
    export const Provider: React.ComponentType<React.ProviderProps<IContextTypes>>;
    export const Consumer: React.ComponentType<React.ConsumerProps<IContextTypes>>;
  }
}

(Sein as any).ReactHUD = {
  Container: HUDContainer,
  Provider,
  Consumer
};

export {
  IHUDContainerProps as IContainerProps,
  IHUDContextTypes as IContextTypes,
  HUDContainer as Container,
  Provider,
  Consumer
};
