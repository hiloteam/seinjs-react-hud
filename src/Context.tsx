/**
 * @File   : Context.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Date   : 10/31/2018, 6:07:08 PM
 * @Description:
 */
import * as React from 'react';
import * as Sein from 'seinjs';

/**
 * `ReactHUD`的Context类型接口。
 */
export interface IContextTypes {
  /**
   * Context当前的hudActor实例引用。
   */
  hudActor: Sein.DomHUD.Actor;
  /**
   * Context当前的Game实例引用。
   */
  game: Sein.Game;
}

/**
 * @hidden
 */
const Context = React.createContext<IContextTypes>({
  hudActor: null,
  game: null
});

/**
 * Context的Provider实例引用，一般不需要自己声明，直接使用`Consumer`即可。
 */
export const Provider = Context.Provider;
/**
 * Context的Consumer实例引用。
 */
export const Consumer = Context.Consumer;
